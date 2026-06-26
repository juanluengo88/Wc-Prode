import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { Prediction } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const uid = request.nextUrl.searchParams.get("uid");
	if (!uid) return NextResponse.json([]);

	const snapshot = await db
		.collection("predictions")
		.where("uid", "==", uid)
		.get();

	const predictions: Prediction[] = snapshot.docs.map((doc) => ({
		predictionId: doc.id,
		...(doc.data() as Omit<Prediction, "predictionId">),
	}));

	return NextResponse.json(predictions);
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { uid, matchId, predictHome, predictAway, predictPenalties, predictPenaltiesWinner } = body as {
		uid: string;
		matchId: string;
		predictHome: number;
		predictAway: number;
		predictPenalties: boolean;
		predictPenaltiesWinner: "HOME_TEAM" | "AWAY_TEAM" | null;
	};

	const existing = await db
		.collection("predictions")
		.where("uid", "==", uid)
		.where("matchId", "==", matchId)
		.limit(1)
		.get();

	if (!existing.empty) {
		const docRef = existing.docs[0].ref;
		await docRef.update({ predictHome, predictAway, predictPenalties: predictPenalties ?? false, predictPenaltiesWinner: predictPenaltiesWinner ?? null });
		return NextResponse.json({
			predictionId: docRef.id,
			...existing.docs[0].data(),
			predictHome,
			predictAway,
			predictPenalties: predictPenalties ?? false,
			predictPenaltiesWinner: predictPenaltiesWinner ?? null,
		} as Prediction);
	}

	const docRef = await db.collection("predictions").add({
		uid,
		matchId,
		predictHome,
		predictAway,
		predictPenalties: predictPenalties ?? false,
		predictPenaltiesWinner: predictPenaltiesWinner ?? null,
		pointsEarned: null,
	});

	return NextResponse.json(
		{
			predictionId: docRef.id,
			uid,
			matchId,
			predictHome,
			predictAway,
			pointsEarned: null,
		} as Prediction,
		{ status: 201 },
	);
}
