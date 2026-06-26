import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const doc = await db.collection("meta").doc("standings").get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Standings not yet synced" },
        { status: 404 },
      );
    }

    const data = doc.data()!;

    return NextResponse.json({
      currentMatchday: data.currentMatchday,
      season: data.season,
      standings: data.standings,
      scorers: data.scorers,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[standings GET error]:", msg);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 },
    );
  }
}
