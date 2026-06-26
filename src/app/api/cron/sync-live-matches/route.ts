import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { fetchSingleMatch, mapStatus } from "@/lib/footballDataApi";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function PUT(request: Request) {
  try {
    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "FOOTBALL_DATA_API_TOKEN not configured" },
        { status: 500 },
      );
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Fetch LIVE matches + SCHEDULED matches starting within the next hour
    const [liveSnap, scheduledSnap] = await Promise.all([
      db.collection("matches").where("status", "==", "LIVE").get(),
      db
        .collection("matches")
        .where("status", "==", "SCHEDULED")
        .where("dateTime", "<=", oneHourFromNow.toISOString())
        .get(),
    ]);

    const matchDocs = [...liveSnap.docs, ...scheduledSnap.docs];

    if (matchDocs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active matches to sync",
        debug: {
          liveCount: liveSnap.size,
          scheduledWithinHourCount: scheduledSnap.size,
          baseUrl: process.env.FOOTBALL_DATA_BASE_URL ?? "https://api.football-data.org/v4 (default)",
          now: now.toISOString(),
          oneHourFromNow: oneHourFromNow.toISOString(),
        },
      });
    }

    const batch = db.batch();
    let updatedCount = 0;
    const toCalculatePoints: string[] = [];
    const syncErrors: string[] = [];
    const skippedNoChange: string[] = [];

    for (const doc of matchDocs) {
      const stored = doc.data();
      try {
        const apiMatch = await fetchSingleMatch(doc.id, token);
        const newStatus = mapStatus(apiMatch.status);
        const newHomeScore = apiMatch.score?.fullTime?.home ?? stored.scoreHome;
        const newAwayScore = apiMatch.score?.fullTime?.away ?? stored.scoreAway;
        const duration = apiMatch.score?.duration ?? null;

        const scoreChanged =
          newHomeScore !== stored.scoreHome || newAwayScore !== stored.scoreAway;
        const statusChanged = newStatus !== stored.status;
        const durationChanged = duration !== stored.scoreDuration;
        const penaltiesChanged =
          (apiMatch.score?.penalties?.home ?? null) !== stored.scorePenaltiesHome ||
          (apiMatch.score?.penalties?.away ?? null) !== stored.scorePenaltiesAway;

        if (!scoreChanged && !statusChanged && !durationChanged && !penaltiesChanged) {
          skippedNoChange.push(doc.id);
          continue;
        }

        const matchRef = db.collection("matches").doc(doc.id);

        if (newStatus === "FINISHED") {
          batch.update(matchRef, {
            scoreHome: newHomeScore,
            scoreAway: newAwayScore,
            status: "FINISHED",
            winner: apiMatch.score?.winner ?? null,
            scoreDuration: duration,
            scoreRegularHome: apiMatch.score?.regularTime?.home ?? null,
            scoreRegularAway: apiMatch.score?.regularTime?.away ?? null,
            scoreExtraHome: apiMatch.score?.extraTime?.home ?? null,
            scoreExtraAway: apiMatch.score?.extraTime?.away ?? null,
            scorePenaltiesHome: apiMatch.score?.penalties?.home ?? null,
            scorePenaltiesAway: apiMatch.score?.penalties?.away ?? null,
            lastScrapedAt: FieldValue.serverTimestamp(),
          });
          toCalculatePoints.push(doc.id);
        } else {
  
          const update: Record<string, unknown> = {
            status: newStatus,
            lastScrapedAt: FieldValue.serverTimestamp(),
          };
          if (scoreChanged) {
            update.scoreHome = newHomeScore;
            update.scoreAway = newAwayScore;
          }
          if (duration) {
            update.scoreDuration = duration;
            update.scoreRegularHome = apiMatch.score?.regularTime?.home ?? null;
            update.scoreRegularAway = apiMatch.score?.regularTime?.away ?? null;
            update.scoreExtraHome = apiMatch.score?.extraTime?.home ?? null;
            update.scoreExtraAway = apiMatch.score?.extraTime?.away ?? null;
            update.scorePenaltiesHome = apiMatch.score?.penalties?.home ?? null;
            update.scorePenaltiesAway = apiMatch.score?.penalties?.away ?? null;
          }
          batch.update(matchRef, update);
        }

        updatedCount++;
      } catch (err: any) {
        console.error(`[Cron Error match ${doc.id}]:`, err?.message || err);
        syncErrors.push(`${doc.id}: ${err?.message || err}`);
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
    }

    // Trigger calculate-points for finished matches (fire and forget)
    for (const matchId of toCalculatePoints) {
      fetch(`${APP_URL}/api/calculate-points/${matchId}`, {
        method: "POST",
        cache: "no-store",
      }).catch((err) =>
        console.error(`[Cron Error] calculate-points failed ${matchId}:`, err),
      );
    }

    // Sync standings whenever at least one match finished
    if (toCalculatePoints.length > 0) {
      fetch(`${APP_URL}/api/cron/sync-standings`, {
        method: "PUT",
        cache: "no-store",
      }).catch((err) =>
        console.error(`[Cron Error] sync-standings failed:`, err),
      );
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed. ${updatedCount} matches updated, ${toCalculatePoints.length} finished.`,
      debug: {
        baseUrl: process.env.FOOTBALL_DATA_BASE_URL ?? "https://api.football-data.org/v4 (default)",
        totalMatchDocs: matchDocs.length,
        skippedNoChange,
        syncErrors,
      },
    });
  } catch (error: any) {
    console.error("[General Cron Error]:", error?.message || error);
    return NextResponse.json(
      { error: "sync failed", detalles: error?.message },
      { status: 500 },
    );
  }
}
