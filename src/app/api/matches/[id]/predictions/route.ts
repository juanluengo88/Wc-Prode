import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { findebyUid } from "@/services/groupService";
import { getPredictionsByMatchId } from "@/services/predictionService";
import { chunk } from "@/lib/utils";
import { FieldPath } from "firebase-admin/firestore";

export interface OtherPrediction {
	userId: string;
	displayName: string;
	predictHome: number;
	predictAway: number;
	pointsEarned: number | null;
	photoURL?: string;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id: matchId } = await params;
	const uid = request.nextUrl.searchParams.get("uid");

	if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

	// Guard: only expose predictions for finished matches
	const matchSnap = await db.collection("matches").doc(matchId).get();
	if (!matchSnap.exists || matchSnap.data()?.status !== "FINISHED") {
		return NextResponse.json([]);
	}

	// Get all groups the current user belongs to
	const groups = await findebyUid(uid);
	if (groups.length === 0) return NextResponse.json([]);

	// Collect unique member UIDs across all groups, excluding current user
	const memberSet = new Set<string>();
	for (const group of groups) {
		for (const memberId of group.members) {
			if (memberId !== uid) memberSet.add(memberId);
		}
	}

	if (memberSet.size === 0) return NextResponse.json([]);

	const memberIds = Array.from(memberSet);

	// Fetch user display names and photos in chunks (Firestore limit: 30 per "in" query)
	const userChunks = chunk(memberIds, 30);
	const userSnapshots = await Promise.all(
		userChunks.map((c) =>
			db.collection("users").where(FieldPath.documentId(), "in", c).get(),
		),
	);
	const userMap = new Map<string, { displayName: string; photoURL?: string }>();
	for (const snapshot of userSnapshots) {
		for (const doc of snapshot.docs) {
			const data = doc.data();
			userMap.set(doc.id, {
				displayName: data.displayName ?? data.email ?? "Usuario",
				photoURL: data.photoURL ?? undefined,
			});
		}
	}

	// Fetch all predictions for this match and filter to group members
	// Note: getPredictionsByMatchId sets uid=doc.id (prediction doc ID), actual user UID is in userId
	const allPredictions = await getPredictionsByMatchId(matchId);
	const result: OtherPrediction[] = allPredictions
		.filter((p) => memberSet.has(p.userId))
		.map((p) => {
			const user = userMap.get(p.userId);
			return {
				userId: p.userId,
				displayName: user?.displayName ?? "Usuario",
				photoURL: user?.photoURL,
				predictHome: p.predictHome,
				predictAway: p.predictAway,
				pointsEarned: p.pointsEarned,
			};
		})
		.sort((a, b) => (b.pointsEarned ?? -1) - (a.pointsEarned ?? -1));

	return NextResponse.json(result);
}
