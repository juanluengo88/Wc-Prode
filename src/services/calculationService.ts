import { Match } from "@/lib/mockData";
import { Prediction } from "@/services/predictionService"; 


/**
 * Evaluates a user's prediction against the actual match result and returns a score.
 *
 * Scoring rules:
 * - 3 points: Exact scoreline (home and away goals match perfectly).
 * - 1 point:  Correct tendency (winner or draw) but wrong scoreline.
 * - 0 points: Wrong tendency, or missing/invalid data.
 *
 * @param prediction - The user's predicted scoreline.
 * @param match - The match containing the actual final score.
 * @returns The points awarded: 3 (exact), 1 (correct tendency), or 0 (miss/invalid).
 */
export function assertPrediction(prediction: Prediction, match: Match): number {
  const realHome = match.scoreHome;
  const realAway = match.scoreAway;
  const predHome = prediction.predictHome;
  const predAway = prediction.predictAway;

  if (
    realHome === null ||
    realAway === null ||
    predHome === null ||
    predAway === null ||
    !Number.isFinite(predHome) ||
    !Number.isFinite(predAway)
  ) {
    return 0;
  }

  if (predHome === realHome && predAway === realAway) {
    return 3;
  }

 
  const getTendency = (home: number, away: number): "home" | "away" | "draw" =>
    home > away ? "home" : home < away ? "away" : "draw";

  if (getTendency(predHome, predAway) === getTendency(realHome, realAway)) {
    return 1;
  }

  return 0;
}
