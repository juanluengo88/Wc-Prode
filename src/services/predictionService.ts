import { db } from "@/lib/firebaseAdmin";

// 1. Definimos el Tipo estricto para la Predicción
export type Prediction = {
  uid: string;         // ID del documento en Firestore
  matchId: string;     // ID del partido oficial
  userId: string;      // ID del usuario que apostó
  predictHome: number; // Goles apostados al local
  predictAway: number; // Goles apostados al visitante
  pointsEarned: number | null; // Puntos ganados (+3, +1, 0 o null si no se jugó)
  timestamp?: string;  // Fecha de creación (opcional)
};

/**
 * Recupera todas las predicciones asociadas a un matchId con tipado estricto
 */
export async function getPredictionsByMatchId(matchId: string): Promise<Prediction[]> {
  const snapshot = await db
    .collection("predictions")
    .where("matchId", "==", matchId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      matchId: data.matchId,
      userId: data.userId,
      predictHome: Number(data.predictHome),
      predictAway: Number(data.predictAway),
      pointsEarned: data.pointsEarned !== undefined ? data.pointsEarned : null,
      ...data 
    } as Prediction;
  });
}

/**
 * 📝 EDITA O ACTUALIZA UNA PREDICCIÓN EXISTENTE EN LA DB
 * @param uid ID del documento de la predicción en Firestore (p.uid)
 * @param data Campos parciales que deseas modificar (ej: { predictHome: 2, predictAway: 1 })
 */
export async function updatePrediction(uid: string, data: Partial<Omit<Prediction, 'uid'>>) {
  if (!uid) {
    throw new Error("Se requiere el UID de la predicción para poder editarla.");
  }

  const docRef = db.collection("predictions").doc(uid);
  
  // Ejecutamos la actualización selectiva en Firestore
  await docRef.update(data);
}