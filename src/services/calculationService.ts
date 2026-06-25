import { Match } from "@/lib/mockData";
import { Prediction } from "@/services/predictionService"; 
import { db } from "@/lib/firebaseAdmin";

/**
 * @returns 
 */
export function assertPrediction(prediction: Prediction, match: Match): number {
  const realHome = match.scoreHome;
  const realAway = match.scoreAway;
  const predHome = prediction.predictHome;
  const predAway = prediction.predictAway;

  if (realHome === null || realAway === null || isNaN(predHome) || isNaN(predAway)) {
    return 0;
  }

  if (predHome === realHome && predAway === realAway) {
    return 3;
  }

  // Use winner field from API if available, otherwise derive from score
  const winner = match.winner ?? (
    realHome > realAway ? "HOME_TEAM" : realAway > realHome ? "AWAY_TEAM" : "DRAW"
  );
  const predictedWinner =
    predHome > predAway ? "HOME_TEAM" : predAway > predHome ? "AWAY_TEAM" : "DRAW";

  return winner === predictedWinner ? 1 : 0;
}
