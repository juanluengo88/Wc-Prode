import { db } from "@/lib/firebaseAdmin";

export interface UserDoc {
  id: string;
  name?: string;
  email?: string;
  totalPoints?: number;
  [key: string]: any; // Por si tenés más campos en tu DB
}

/**
 * Buscar un usuario por su ID único de documento (UID de Firebase)
 */
export async function getUserById(id: string): Promise<UserDoc> {
  const docRef = db.collection("users").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("User not found");
  }

  return { id: docSnap.id, ...docSnap.data() } as UserDoc;
}

/**
 * Buscar un usuario por su Email (Útil para logins o buscadores)
 */
export async function getUserByEmail(email: string): Promise<UserDoc> {
  const snapshot = await db
    .collection("users")
    .where("email", "==", email.trim().toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("User not found by email");
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as UserDoc;
}