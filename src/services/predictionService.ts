import { db } from "@/lib/firebaseAdmin";

// 1. Definimos el Tipo estricto para la Predicción
export type Prediction = {
  uid: string;          // ID del documento en Firestore
  matchId: string;     // ID del partido oficial
  userId: string;      // ID del usuario que apostó
  predictHome: number; // Goles apostados al local
  predictAway: number; // Goles apostados al visitante
  pointsEarned: number | null; // Puntos ganados (+3, +1, 0 o null si no se jugó)
  timestamp?: string;  // Fecha de creación (opcional)
};

/**
 * Recupera todas las predicciones asociadas a un matchId con tipado estricto
 * @param matchId ID del partido
 * @returns Promesa que resuelve en un Array de tipo Prediction
 */
export async function getPredictionsByMatchId(matchId: string): Promise<Prediction[]> {
  const snapshot = await db
    .collection("predictions")
    .where("matchId", "==", matchId)
    .get();

  // Forzamos el mapeo para que cumpla rigurosamente con la estructura del tipo Prediction
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      matchId: data.matchId,
      userId: data.userId,
      predictHome: Number(data.predictHome),
      predictAway: Number(data.predictAway),
      pointsEarned: data.pointsEarned !== undefined ? data.pointsEarned : null,
      ...data // Por si guardas campos extra en la base de datos
    } as Prediction;
  });
}