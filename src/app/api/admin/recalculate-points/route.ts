import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { assertPrediction } from "@/services/calculationService";
import { Match } from "@/lib/mockData";
import { Prediction } from "@/services/predictionService";

// Firestore batches are capped at 500 operations
const BATCH_SIZE = 400;

async function commitInBatches(
  operations: Array<{ ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }>
) {
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const chunk = operations.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const op of chunk) {
      batch.update(op.ref, op.data);
    }
    await batch.commit();
  }
}

export async function POST() {
  try {
    // 1. Fetch all finished matches
    const matchesSnap = await db
      .collection("matches")
      .where("status", "==", "FINISHED")
      .get();

    if (matchesSnap.empty) {
      return NextResponse.json({
        success: true,
        message: "No finished matches found. Nothing to recalculate.",
        matchesProcessed: 0,
      });
    }

    const finishedMatches = matchesSnap.docs.map((doc) => ({
      matchId: doc.id,
      ...doc.data(),
    })) as Match[];

    // 2. Fetch all users and reset their totalPoints to 0
    const usersSnap = await db.collection("users").get();
    const userResetOps = usersSnap.docs.map((doc) => ({
      ref: doc.ref,
      data: { totalPoints: 0 },
    }));
    await commitInBatches(userResetOps);

    // 3. Accumulate points per userId across all matches
    const pointsPerUser: Record<string, number> = {};
    const predictionOps: Array<{ ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }> = [];
    const report: Array<{ matchId: string; predictions: number; pointsAwarded: number }> = [];

    for (const match of finishedMatches) {
      const predsSnap = await db
        .collection("predictions")
        .where("matchId", "==", match.matchId)
        .get();

      if (predsSnap.empty) {
        report.push({ matchId: match.matchId, predictions: 0, pointsAwarded: 0 });
        continue;
      }

      const predictions = predsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          matchId: data.matchId ?? "",
          userId: data.userId ?? data.uid ?? "",
          predictHome: data.predictHome !== null && data.predictHome !== undefined ? Number(data.predictHome) : null,
          predictAway: data.predictAway !== null && data.predictAway !== undefined ? Number(data.predictAway) : null,
          pointsEarned: data.pointsEarned !== undefined ? data.pointsEarned : null,
          predictPenalties: data.predictPenalties ?? false,
          predictPenaltiesWinner: data.predictPenaltiesWinner ?? null,
        } as Prediction;
      });

      let matchPoints = 0;

      for (const pred of predictions) {
        const points = assertPrediction(pred, match);

        predictionOps.push({
          ref: db.collection("predictions").doc(pred.uid),
          data: { pointsEarned: points },
        });

        if (pred.userId) {
          pointsPerUser[pred.userId] = (pointsPerUser[pred.userId] ?? 0) + points;
        }

        matchPoints += points;
      }

      report.push({
        matchId: match.matchId,
        predictions: predictions.length,
        pointsAwarded: matchPoints,
      });
    }

    // 4. Flush prediction updates
    await commitInBatches(predictionOps);

    // 5. Apply accumulated user totals
    const userPointOps = Object.entries(pointsPerUser).map(([userId, total]) => ({
      ref: db.collection("users").doc(userId),
      data: { totalPoints: total },
    }));
    await commitInBatches(userPointOps);

    return NextResponse.json({
      success: true,
      message: "Points recalculated from scratch for all finished matches.",
      matchesProcessed: finishedMatches.length,
      predictionsUpdated: predictionOps.length,
      usersUpdated: userPointOps.length,
      pointsPerUser,
      matchReport: report,
    });
  } catch (error: any) {
    console.error("[recalculate-points error]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to recalculate points", details: error?.message },
      { status: 500 }
    );
  }
}
