import { db } from "@/lib/firebaseAdmin"; // ajusta el path a tu config
import { NextResponse } from "next/server";
import { Match } from "@/lib/mockData";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

 const snapshot = await db
  .collection("matches")
  .where("id", "==", id)   
  .limit(1)
  .get();

if (snapshot.empty) {
  return NextResponse.json({ error: "Match not found" }, { status: 404 });
}

const data = snapshot.docs[0].data();

if (!data) {
  return NextResponse.json({ error: "Match not found" }, { status: 404 });
}

const match: Match = {
  matchId: data.matchId,
  teamHome: data.teamHome,
  teamAway: data.teamAway,
  teamHomeFlag: data.teamHomeFlag,
  teamAwayFlag: data.teamAwayFlag,
  dateTime: data.dateTime,
  status: data.status,
  scoreHome: data.scoreHome,
  scoreAway: data.scoreAway,
  groupOrStage: data.groupOrStage
};

return NextResponse.json(match);

}