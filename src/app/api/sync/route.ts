import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";
import {
	fetchWCMatches,
	mapStatus,
	mapGroupOrStage,
} from "@/lib/footballDataApi";
import type { Match } from "@/lib/mockData";

/**
 * POST /api/sync
 *
 * Fetches all WC matches from football-data.org, updates Firestore, and
 * calculates prediction points for newly-finished matches.
 *
 * Protected by the SYNC_SECRET env var — pass it as the Authorization header:
 *   Authorization: Bearer <SYNC_SECRET>
 *
 * Designed to be called by a cron job (e.g. Vercel Cron) during the tournament.
 * Uses only 1 API request, well within the 10 req/min rate limit.
 */
export async function POST(request: NextRequest) {
	// ─── Auth check ──────────────────────────────────────────────────────────
	const secret = process.env.SYNC_SECRET;
	if (secret) {
		const authHeader = request.headers.get("authorization") ?? "";
		if (authHeader !== `Bearer ${secret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	const token = process.env.FOOTBALL_DATA_API_TOKEN;
	if (!token) {
		return NextResponse.json(
			{ error: "FOOTBALL_DATA_API_TOKEN not configured" },
			{ status: 500 },
		);
	}

	// ─── Fetch from API ───────────────────────────────────────────────────────
	const apiMatches = await fetchWCMatches(token);

	// ─── Load current Firestore state ─────────────────────────────────────────
	const existing = await db.collection("matches").get();
	const existingById = new Map<string, Match & { matchId: string }>();
	for (const doc of existing.docs) {
		existingById.set(doc.id, {
			matchId: doc.id,
			...(doc.data() as Omit<Match, "matchId">),
		});
	}

	const matchBatch = db.batch();
	const newlyFinished: {
		matchId: string;
		scoreHome: number;
		scoreAway: number;
	}[] = [];

	for (const apiMatch of apiMatches) {
		const matchId = String(apiMatch.id);
		const newStatus = mapStatus(apiMatch.status);
		const prev = existingById.get(matchId);

		const data = {
			teamHome: apiMatch.homeTeam.name,
			teamAway: apiMatch.awayTeam.name,
			teamHomeFlag: apiMatch.homeTeam.crest,
			teamAwayFlag: apiMatch.awayTeam.crest,
			dateTime: apiMatch.utcDate,
			status: newStatus,
			scoreHome: apiMatch.score.fullTime.home,
			scoreAway: apiMatch.score.fullTime.away,
			groupOrStage: mapGroupOrStage(apiMatch),
		};

		matchBatch.set(db.collection("matches").doc(matchId), data);

		// Detect matches that just finished (need point calculation)
		const justFinished =
			newStatus === "FINISHED" &&
			prev?.status !== "FINISHED" &&
			apiMatch.score.fullTime.home !== null &&
			apiMatch.score.fullTime.away !== null;

		if (justFinished) {
			newlyFinished.push({
				matchId,
				scoreHome: apiMatch.score.fullTime.home!,
				scoreAway: apiMatch.score.fullTime.away!,
			});
		}
	}

	await matchBatch.commit();

	// ─── Calculate points for newly finished matches ───────────────────────────
	let pointsUpdated = 0;

	for (const { matchId, scoreHome, scoreAway } of newlyFinished) {
		const predsSnapshot = await db
			.collection("predictions")
			.where("matchId", "==", matchId)
			.where("pointsEarned", "==", null)
			.get();

		if (predsSnapshot.empty) continue;

		const predBatch = db.batch();
		const userDelta: Record<string, number> = {};

		for (const predDoc of predsSnapshot.docs) {
			const pred = predDoc.data();
			const points = calcPoints(
				pred.predictHome,
				pred.predictAway,
				scoreHome,
				scoreAway,
			);

			predBatch.update(predDoc.ref, { pointsEarned: points });

			if (points > 0) {
				userDelta[pred.uid] = (userDelta[pred.uid] ?? 0) + points;
			}
			pointsUpdated++;
		}

		await predBatch.commit();

		// Increment totalPoints for each affected user
		if (Object.keys(userDelta).length > 0) {
			const userBatch = db.batch();
			for (const [uid, delta] of Object.entries(userDelta)) {
				userBatch.update(db.collection("users").doc(uid), {
					totalPoints: FieldValue.increment(delta),
				});
			}
			await userBatch.commit();
		}
	}

	return NextResponse.json({
		matchesSynced: apiMatches.length,
		newlyFinished: newlyFinished.length,
		predictionsScored: pointsUpdated,
	});
}

function calcPoints(
	predictHome: number,
	predictAway: number,
	realHome: number,
	realAway: number,
): number {
	if (predictHome === realHome && predictAway === realAway) return 3;
	const predWinner = Math.sign(predictHome - predictAway);
	const realWinner = Math.sign(realHome - realAway);
	return predWinner === realWinner ? 1 : 0;
}
