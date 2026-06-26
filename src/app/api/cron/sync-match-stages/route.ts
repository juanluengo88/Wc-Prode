import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { fetchSingleMatch, mapStatus, mapGroupOrStage } from "@/lib/footballDataApi";
import { sleep } from "@/lib/utils";

/**
 * PUT /api/cron/sync-match-stages
 *
 * For each SCHEDULED match with null teamHome or teamAway, calls the individual
 * match endpoint (which returns full team data unlike the competition endpoint).
 * Updates teamHome/teamAway only for the side that is already resolved in the API.
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

    // Find which match IDs are still TBD in Firestore
    const snap = await db
      .collection("matches")
      .where("status", "==", "SCHEDULED")
      .get();

    const tbdIds = snap.docs
      .filter((d) => d.data().teamHome == null || d.data().teamAway == null)
      .map((d) => d.id);

    if (tbdIds.length === 0) {
      return NextResponse.json({ success: true, message: "No TBD matches to update" });
    }

    const batch = db.batch();
    let updatedCount = 0;

    for (const id of tbdIds) {
      try {
        const match = await fetchSingleMatch(id, token);
        await sleep(600); // 10 req/min limit → 6s between calls

        const homeResolved = match.homeTeam.id !== null && match.homeTeam.name !== null;
        const awayResolved = match.awayTeam.id !== null && match.awayTeam.name !== null;
        if (!homeResolved && !awayResolved) continue;

        const update: Record<string, unknown> = {
          groupOrStage: mapGroupOrStage(match),
          status: mapStatus(match.status),
        };
        if (homeResolved) {
          update.teamHome = match.homeTeam.name;
          update.teamHomeFlag = match.homeTeam.crest;
        }
        if (awayResolved) {
          update.teamAway = match.awayTeam.name;
          update.teamAwayFlag = match.awayTeam.crest;
        }

        batch.update(db.collection("matches").doc(id), update);
        updatedCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[sync-match-stages] Error match ${id}:`, msg);
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${tbdIds.length} TBD matches, updated ${updatedCount}.`,
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
