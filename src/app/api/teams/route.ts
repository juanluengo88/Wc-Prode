import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Team } from "@/lib/footballDataApi";

export const dynamic = "force-dynamic";

export async function GET() {
	const snapshot = await db.collection("teams").get();
	const teams: Team[] = snapshot.docs.map((doc) => ({
		teamId: doc.id,
		...(doc.data() as Omit<Team, "teamId">),
	}));
	return NextResponse.json(teams);
}
