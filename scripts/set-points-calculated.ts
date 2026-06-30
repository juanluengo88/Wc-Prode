/**
 * For every FINISHED match:
 *  - Sets pointsCalculated: true
 *  - If scoreHome or scoreAway is missing, fetches them from football-data.org
 *    and updates the document.
 *
 * Usage (from the project root):
 *   npx tsx scripts/set-points-calculated.ts
 */

import dotenv from "dotenv";
dotenv.config({ path: [".env", ".env.local"] });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
	fetchSingleMatch,
	fetchESPNMatch,
} from "../src/lib/footballDataApi.js";
import { sleep } from "../src/lib/utils.js";

const BATCH_SIZE = 400;

async function main() {
	const token = process.env.FOOTBALL_DATA_API_TOKEN;
	if (!token) {
		console.error("❌  FOOTBALL_DATA_API_TOKEN is not set in .env file");
		process.exit(1);
	}

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

	const snapshot = await db.collection("matches").get();
	const finished = snapshot.docs.filter((d) => d.data().status === "FINISHED");

	console.log(`Found ${snapshot.size} matches, ${finished.length} FINISHED.`);

	if (finished.length === 0) {
		console.log("Nothing to update.");
		return;
	}

	// ─── Fetch missing scores from API ───────────────────────────────────────────
	const scoreUpdates = new Map<
		string,
		{ scoreHome: number; scoreAway: number }
	>();

	for (const doc of finished) {
		const data = doc.data();
		if (data.scoreHome != null && data.scoreAway != null) continue;

		console.log(`  Fetching scores for match ${doc.id}...`);

		let apiMatch = null;
		while (apiMatch === null) {
			const espnMatchId: string | undefined = data.espnMatchId;
			try {
				apiMatch = espnMatchId
					? await fetchESPNMatch(espnMatchId)
					: await fetchSingleMatch(doc.id, token ?? "");
			} catch (err: unknown) {
				// Respect rate-limit: the API returns a Retry-After-style header via
				// the error, but fetchSingleMatch throws on non-OK. Re-fetch headers
				// aren't available here, so wait a fixed 60 s on any fetch failure.
				const msg = err instanceof Error ? err.message : String(err);
				const wait = msg.match(/429/) ? 60 : 5;
				console.warn(
					`  ⚠️  Error fetching match ${doc.id}: ${msg}. Retrying in ${wait}s...`,
				);
				await sleep(wait * 1000);
			}
		}

		const { home, away } = apiMatch.score.fullTime;
		if (home != null && away != null) {
			scoreUpdates.set(doc.id, { scoreHome: home, scoreAway: away });
			console.log(`  ✅  Match ${doc.id}: ${home} - ${away}`);
		} else {
			console.warn(
				`  ⚠️  Match ${doc.id} is FINISHED but API returned null scores — skipping score update.`,
			);
		}
	}

	// ─── Write to Firestore in batches ───────────────────────────────────────────
	let updated = 0;
	for (let i = 0; i < finished.length; i += BATCH_SIZE) {
		const chunk = finished.slice(i, i + BATCH_SIZE);
		const batch = db.batch();

		for (const doc of chunk) {
			const update: Record<string, unknown> = { pointsCalculated: true };
			const scores = scoreUpdates.get(doc.id);
			if (scores) {
				update.scoreHome = scores.scoreHome;
				update.scoreAway = scores.scoreAway;
			}
			batch.update(doc.ref, update);
		}

		await batch.commit();
		updated += chunk.length;
		console.log(`Updated ${updated}/${finished.length}`);
	}

	console.log("✅  Done.");
}

main().catch((err) => {
	console.error("❌  Failed:", err);
	process.exit(1);
});
