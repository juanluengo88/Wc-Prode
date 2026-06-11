import { db } from "@/lib/firebaseAdmin";
import { chunk } from "@/lib/utils";
import { FieldValue } from "firebase-admin/firestore";
import { FieldPath } from "firebase-admin/firestore";

export interface GroupDocDB {
	id?: string;
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

	// Get the created document snapshot and return its data
	const docSnap = await docRef.get();

	if (!docSnap.exists) {
		throw new Error("Failed to create group.");
	}

	const createdData = docSnap.data();

	return { id: docSnap.id, ...createdData };
}

export async function findebyUid(uid: string) {
	const groupsSnapshot = await db
		.collection("groups")
		.where("members", "array-contains", uid)
		.get();

	const groups = groupsSnapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			gId: doc.id,
			name: data.name,
			members: data.members,
			inviteCode: data.inviteCode,
		};
	});

	return groups;
}

export async function findebyid(groupId: string) {
	const groupsSnapshot = await db.collection("groups").doc(groupId);
	const docSnap = await groupsSnapshot.get();

	if (!docSnap.exists) {
		throw new Error("group not found");
	}

	const data = docSnap.data();

	const responseData = { id: docSnap.id, ...data };

	return responseData;
}

/**
 * Agrega el ID de un usuario al array de 'members' de un grupo.
 * @param groupId - El ID del documento del grupo
 * @param userId - El UID del usuario que se va a unir
 */
export async function addUserToGroup(
	groupId: string,
	userId: string,
): Promise<void> {
	try {
		const groupRef = db.collection("groups").doc(groupId);

		const groupSnap = await groupRef.get();
		if (!groupSnap.exists) {
			throw new Error("El grupo especificado no existe.");
		}

		await groupRef.update({
			members: FieldValue.arrayUnion(userId),
		});
	} catch (error: any) {
		console.error(`[GroupService - addUserToGroup Error]:`, error.message);
		throw new Error("No se pudo agregar el usuario al grupo.");
	}
}

export async function addUsersToGroup(
	groupId: string,
	userIds: string[],
): Promise<void> {
	if (!userIds.length) return;

	const groupRef = db.collection("groups").doc(groupId);
	const groupSnap = await groupRef.get();

	if (!groupSnap.exists) {
		throw new Error("El grupo especificado no existe.");
	}

	await groupRef.update({
		members: FieldValue.arrayUnion(...userIds),
	});
}

export async function getLeaderboardByGroupId(groupId: string) {
	const groupSnap = await db.collection("groups").doc(groupId).get();

	if (!groupSnap.exists) {
		throw new Error("Group not found");
	}

	const members: string[] = groupSnap.data()?.members ?? [];

	if (members.length === 0) {
		return [];
	}

	const memberChunks = chunk(members, 30);

	const userSnapshots = await Promise.all(
		memberChunks.map((chunk) =>
			db.collection("users").where(FieldPath.documentId(), "in", chunk).get(),
		),
	);

	return userSnapshots
		.flatMap((snapshot) => snapshot.docs)
		.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
}
