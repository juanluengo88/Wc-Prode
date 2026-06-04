import { db } from "@/lib/firebaseAdmin";

export interface UserDoc {
  id: string;
  name?: string;
  email?: string;
  totalPoints?: number;
  [key: string]: any; 
}

export async function getUserById(id: string): Promise<UserDoc> {
  const docRef = db.collection("users").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("User not found");
  }

  return { id: docSnap.id, ...docSnap.data() } as UserDoc;
}

/**
 * Actualiza los campos de un usuario de forma segura
 * @param id UID del usuario
 * @param data Objeto con las propiedades a actualizar (ej: { totalPoints: 10 })
 */
export async function updateById(id: string, data: Partial<UserDoc>) {
  const docRef = db.collection("users").doc(id);
  await docRef.update(data);
}