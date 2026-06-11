import { db } from "@/lib/firebaseAdmin";

export interface UserDoc {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  totalPoints: number;
  photoURL?: string;
  admin?: boolean;
  groupId?: string | null;
}

export async function getUsers(): Promise<UserDoc[]> {
  // Lo ideal es traerlos ordenados por puntos descendente para el rank
  const snapshot = await db
      .collection("users")
      .get();
  
  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      id: doc.id, // O id según manejes en tu UserDoc
      uid: doc.id,
      displayName: data.displayName ?? "Usuario",
      email: data.email ?? "",
      totalPoints: Number(data.totalPoints ?? 0),
      groupId: data.groupId ?? null, // 🌟 Clave para saber a qué grupo pertenecen
      rank: index + 1,
      ...data
    } as UserDoc;
  });
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
