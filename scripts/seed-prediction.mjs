/**
 * Seed a prediction directly into Firestore, bypassing the UI lock logic.
 *
 * Usage:
 *   node scripts/seed-prediction.mjs \
 *     --uid <userId> \
 *     --matchId <matchId> \
 *     --home <score> \
 *     --away <score> \
 *     [--penalties] \
 *     [--winner HOME_TEAM|AWAY_TEAM]
 *
 * Requires .env.local to be present (or the env vars set in the shell).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Load .env.local so we don't need to export vars manually
// ---------------------------------------------------------------------------
const envPath = resolve(process.cwd(), ".env.local");
try {
	const lines = readFileSync(envPath, "utf8").split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eqIdx = trimmed.indexOf("=");
		if (eqIdx === -1) continue;
		const key = trimmed.slice(0, eqIdx).trim();
		const value = trimmed
			.slice(eqIdx + 1)
			.trim()
			.replace(/^["']|["']$/g, "");
		if (!process.env[key]) process.env[key] = value;
	}
} catch {
	// .env.local not found — rely on shell env vars
}

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
function arg(flag, required = false) {
	const idx = process.argv.indexOf(flag);
	if (idx === -1) {
		if (required) {
			console.error(`Missing required argument: ${flag}`);
			process.exit(1);
		}
		return undefined;
	}
	return process.argv[idx + 1];
}

const uid = arg("--uid", true);
const matchId = arg("--matchId", true);
const predictHome = Number(arg("--home", true));
const predictAway = Number(arg("--away", true));
const predictPenalties = process.argv.includes("--penalties");
const predictPenaltiesWinner = arg("--winner") ?? null;

if (isNaN(predictHome) || isNaN(predictAway)) {
	console.error("--home and --away must be numbers");
	process.exit(1);
}

if (
	predictPenaltiesWinner &&
	!["HOME_TEAM", "AWAY_TEAM"].includes(predictPenaltiesWinner)
) {
	console.error("--winner must be HOME_TEAM or AWAY_TEAM");
	process.exit(1);
}

// ---------------------------------------------------------------------------
// Init Firebase Admin
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Upsert prediction
// ---------------------------------------------------------------------------
const payload = {
	uid,
	matchId,
	predictHome,
	predictAway,
	predictPenalties,
	predictPenaltiesWinner,
	pointsEarned: null,
};

console.log("Writing prediction:", payload);

const existing = await db
	.collection("predictions")
	.where("uid", "==", uid)
	.where("matchId", "==", matchId)
	.limit(1)
	.get();

if (!existing.empty) {
	const docRef = existing.docs[0].ref;
	await docRef.update({
		predictHome,
		predictAway,
		predictPenalties,
		predictPenaltiesWinner,
	});
	console.log(`Updated existing prediction  id=${docRef.id}`);
} else {
	const docRef = await db.collection("predictions").add(payload);
	console.log(`Created new prediction  id=${docRef.id}`);
}

process.exit(0);
