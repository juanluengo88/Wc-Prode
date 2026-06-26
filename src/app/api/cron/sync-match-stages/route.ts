import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { fetchWCMatches, mapStatus, mapGroupOrStage } from "@/lib/footballDataApi";

/**
 * PUT /api/cron/sync-match-stages
 *
 * Fetches all WC matches in a single API call, then updates any Firestore
 * SCHEDULED match that has a null/empty teamHome or teamAway with the resolved
 * team data from the API. Runs once per day via Vercel Cron.
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

    const tbdDocs = snap.docs.filter(
      (d) => !d.data().teamHome || !d.data().teamAway,
    );

    if (tbdDocs.length === 0) {
      return NextResponse.json({ success: true, message: "No TBD matches to update" });
    }

    const tbdIdSet = new Set(tbdDocs.map((d) => d.id));

    // Single API call to get all WC matches
    const apiMatches = await fetchWCMatches(token);

    // Index by ID for fast lookup
    const apiById = new Map(apiMatches.map((m) => [String(m.id), m]));

    const batch = db.batch();
    let updatedCount = 0;
    const skipped: string[] = [];

    for (const id of tbdIdSet) {
      const match = apiById.get(id);
      if (!match) {
        skipped.push(`${id}: not found in API`);
        continue;
      }

      const homeResolved = Boolean(match.homeTeam.id && match.homeTeam.name);
      const awayResolved = Boolean(match.awayTeam.id && match.awayTeam.name);

      if (!homeResolved && !awayResolved) {
        skipped.push(`${id} (home: ${match.homeTeam.name || "TBD"}, away: ${match.awayTeam.name || "TBD"})`);
        continue;
      }

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
    }

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${tbdDocs.length} TBD matches, updated ${updatedCount}.`,
      skipped,
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
