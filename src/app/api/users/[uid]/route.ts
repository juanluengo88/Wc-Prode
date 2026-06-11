import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { User } from "@/lib/mockData";

// GET /api/users/[uid]
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ uid: string }> },
) {
	const { uid } = await params;
	const doc = await db.collection("users").doc(uid).get();

	if (!doc.exists) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json({ uid, ...(doc.data() as Omit<User, "uid">) });
}

// PATCH /api/users/[uid] — update display name and/or photo
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ uid: string }> },
) {
	const { uid } = await params;
	const body = await request.json();
	const { displayName, photoURL } = body as {
		displayName?: string;
		photoURL?: string;
	};

	const updates: Record<string, unknown> = {};
	if (displayName !== undefined) updates.displayName = displayName;
	if (photoURL !== undefined) updates.photoURL = photoURL;

	const docRef = db.collection("users").doc(uid);
	const before = await docRef.get();

	if (!before.exists) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	await docRef.update(updates);
	return NextResponse.json({ uid, ...(before.data() as Omit<User, "uid">), ...updates });
}
