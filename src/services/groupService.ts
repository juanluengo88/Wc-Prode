import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface GroupDocDB {
  name: string;
  inviteCode: string;
  members: string[];
  createdBy: string;
  createdAt: any;
}

export function generateGroupInviteCode(): string {
  const alphabetAndNumbers =
    "23456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let uniqueCode = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetAndNumbers.length);
    uniqueCode += alphabetAndNumbers.charAt(randomIndex);
  }

  return uniqueCode;
}

/**
 * @param name
 * @param creatorUid
 */
export async function createGroup(name: string, creatorUid: string) {
  if (!name.trim()) throw new Error("El nombre del grupo es obligatorio.");
  if (!creatorUid) throw new Error("Se requiere el UID del creador.");

  const inviteCode = generateGroupInviteCode();

  const newGroupData: GroupDocDB = {
    name: name.trim(),
    inviteCode: inviteCode,
    members: [creatorUid],
    createdBy: creatorUid,
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("groups").add(newGroupData);

  return { docRef };
}

export async function findById(uid: string) {
  const groupsSnapshot = await db.collection("groups").get();

  const groups = groupsSnapshot.docs.map((doc) => {
    const data = doc.data(); //falla
    if (data.members.includes(uid)) {
      return {
        gId: doc.id,
        name: data.name,
        inviteCode: data.inviteCode,
      };
    }
  });

  return groups;
}
