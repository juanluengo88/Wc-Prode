/**
 * Seed script: fetches all WC matches from football-data.org and writes them
 * to the Firestore `matches` collection.
 *
 * Usage (from the project root):
 *   npm run seed
 *
 * Idempotent — uses the API match ID as the Firestore document ID.
 * Running multiple times will overwrite existing documents with fresh data.
 */

import dotenv from "dotenv";
import { sleep } from "../src/lib/utils.js";
import {
	Team,
	fetchWCMatches,
	mapStatus,
	mapGroupOrStage,
	fetchTeamData,
} from "../src/lib/footballDataApi.js";

dotenv.config({ path: [".env", ".env.local"] }); // Load env vars before any other imports

import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

const processTeam = async (
	teamId: number,
	token: string,
): Promise<Team | null> => {
	let teamData: Team | null = null;
	while (teamData === null) {
		const _teamData = await fetchTeamData(teamId, token);
		if (typeof _teamData !== "number") {
			teamData = _teamData;
		} else {
			console.log(`Waiting for ${_teamData} seconds before retrying...`);
			await sleep(_teamData * 1000);
		}
	}
	return teamData;
};

async function main() {
	const token = process.env.FOOTBALL_DATA_API_TOKEN;
	if (!token) {
		console.error("❌  FOOTBALL_DATA_API_TOKEN is not set in .env file");
		process.exit(1);
	}

	// ─── Firebase Admin init ────────────────────────────────────────────────────
	if (!getApps().length) {
		initializeApp({
			credential: cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
			}),
		});
	}
	const db = getFirestore(process.env.FIRESTORE_DB || "");

	// ─── Fetch from API ─────────────────────────────────────────────────────────
	console.log("⚽  Fetching WC matches from football-data.org...");
	const matches = await fetchWCMatches(token);
	console.log(`   Found ${matches.length} matches.`);

	// ─── Write to Firestore (batch, idempotent) ──────────────────────────────────
	// Firestore batch limit is 500. WC has ~80 matches — well within limits.
	const batch = db.batch();

	for (const match of matches) {
		const docRef = db.collection("matches").doc(String(match.id));
		batch.set(docRef, {
			teamHome: match.homeTeam.name,
			teamAway: match.awayTeam.name,
			teamHomeFlag: match.homeTeam.crest,
			teamAwayFlag: match.awayTeam.crest,
			dateTime: match.utcDate,
			status: mapStatus(match.status),
			scoreHome: match.score.fullTime.home,
			scoreAway: match.score.fullTime.away,
			groupOrStage: mapGroupOrStage(match),
			scoreDuration: match.score.duration ?? null,
			scoreRegularHome: match.score.regularTime?.home ?? null,
			scoreRegularAway: match.score.regularTime?.away ?? null,
			scoreExtraHome: match.score.extraTime?.home ?? null,
			scoreExtraAway: match.score.extraTime?.away ?? null,
			scorePenaltiesHome: match.score.penalties?.home ?? null,
			scorePenaltiesAway: match.score.penalties?.away ?? null,
		});
	}

	const teams = new Set<number>(
		matches
			.flatMap((m) => [m.homeTeam.id, m.awayTeam.id])
			.filter((id) => id != null),
	);
	for (const teamId of teams) {
		const teamData = await processTeam(teamId, token);
		const teamDocRef = db.collection("teams").doc(String(teamId));
		batch.set(teamDocRef, teamData);
	}

	await batch.commit();
	console.log(
		`✅  Seeded ${matches.length} matches and ${teams.size} teams into Firestore.`,
	);
}

main().catch((err) => {
	console.error("❌  Seed failed:", err);
	process.exit(1);
});
