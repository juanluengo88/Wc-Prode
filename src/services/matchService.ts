import { db } from "@/lib/firebaseAdmin";

// Tu función original corregida con Tipado estricto
export async function getMatchById(id: string) {
  const docRef = db.collection("matches").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Match not found");
  }

  return { id: docSnap.id, ...docSnap.data() };
}

