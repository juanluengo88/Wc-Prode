import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { Prediction } from "@/lib/mockData";

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
	const { uid, matchId, predictHome, predictAway } = body as {
		uid: string;
		matchId: string;
		predictHome: number;
		predictAway: number;
	};

	// Upsert: update existing prediction or create a new one
	const existing = await db
		.collection("predictions")
		.where("uid", "==", uid)
		.where("matchId", "==", matchId)
		.limit(1)
		.get();

	if (!existing.empty) {
		const docRef = existing.docs[0].ref;
		await docRef.update({ predictHome, predictAway });
		const updated = await docRef.get();
		return NextResponse.json({
			predictionId: docRef.id,
			...updated.data(),
		} as Prediction);
	}

	const docRef = await db.collection("predictions").add({
		uid,
		matchId,
		predictHome,
		predictAway,
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
