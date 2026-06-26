import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { Match } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
	const snapshot = await db
		.collection("matches")
		.orderBy("dateTime", "asc")
		.get();
	const matches: Match[] = snapshot.docs.map((doc) => ({
		matchId: doc.id,
		...(doc.data() as Omit<Match, "matchId">),
	}));
	return NextResponse.json(matches);
}
