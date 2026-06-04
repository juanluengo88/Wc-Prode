import { Match } from "@/lib/mockData";
import { Prediction } from "@/services/predictionService"; 

/**
 * Función Matemática Pura: Evalúa una predicción contra el resultado real
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

  const tendenciaReal = realHome > realAway ? 1 : realHome < realAway ? 2 : 0;
  const tendenciaPred = predHome > predAway ? 1 : predHome < predAway ? 2 : 0;

  if (tendenciaReal === tendenciaPred) {
    return 1;
  }

  return 0;
}