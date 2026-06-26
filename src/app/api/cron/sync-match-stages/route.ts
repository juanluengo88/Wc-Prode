import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { fetchWCMatches, mapStatus, mapGroupOrStage } from "@/lib/footballDataApi";

/**
 * PUT /api/cron/sync-match-stages
 *
 * Fetches all WC matches from football-data.org and updates only the ones
 * that currently have null teamHome or teamAway in Firestore.
 * Runs once per day via Vercel Cron.
 */
export async function PUT() {
  try {
    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "FOOTBALL_DATA_API_TOKEN not configured" },
        { status: 500 },
      );
    }

    // Find which match IDs are still TBD
    const snap = await db
      .collection("matches")
      .where("status", "==", "SCHEDULED")
      .get();

    const tbdIds = new Set(
      snap.docs
        .filter((d) => !d.data().teamHome || !d.data().teamAway)
        .map((d) => d.id),
    );

    if (tbdIds.size === 0) {
      return NextResponse.json({ success: true, message: "No TBD matches to update" });
    }

    // Fetch all WC matches from the API (single request)
    const apiMatches = await fetchWCMatches(token);

    const batch = db.batch();
    let updatedCount = 0;

    for (const match of apiMatches) {
      const id = String(match.id);
      if (!tbdIds.has(id)) continue;
      if (match.homeTeam.id === null && match.awayTeam.id === null) continue; // still TBD in the API too

      batch.update(db.collection("matches").doc(id), {
        teamHome: match.homeTeam.name,
        teamAway: match.awayTeam.name,
        teamHomeFlag: match.homeTeam.crest,
        teamAwayFlag: match.awayTeam.crest,
        groupOrStage: mapGroupOrStage(match),
        status: mapStatus(match.status),
      });
      updatedCount++;
    }

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Found ${tbdIds.size} TBD matches, updated ${updatedCount}.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[sync-match-stages error]:", msg);
    return NextResponse.json(
      { error: "sync failed", details: msg },
      { status: 500 },
    );
  }
}
