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

dotenv.config({ path: [".env", ".env.local"] }); // Load env vars before any other imports

// Dynamic imports ensure firebase-admin reads credentials AFTER env is loaded
const { initializeApp, getApps, cert } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
const { fetchWCMatches, mapStatus, mapGroupOrStage } =
	await import("../src/lib/footballDataApi.js");

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
	const db = getFirestore();

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
		});
	}

	await batch.commit();
	console.log(`✅  Seeded ${matches.length} matches into Firestore.`);
}

main().catch((err) => {
	console.error("❌  Seed failed:", err);
	process.exit(1);
});
