import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { User } from "@/lib/mockData";

// GET /api/users — sorted leaderboard
export async function GET() {
	const snapshot = await db
		.collection("users")
		.orderBy("totalPoints", "desc")
		.get();

	const users: User[] = snapshot.docs.map((doc, index) => ({
		uid: doc.id,
		...(doc.data() as Omit<User, "uid">),
		rank: index + 1,
	}));

	return NextResponse.json(users);
}

// POST /api/users — create or update user profile (called on first login / signup)
export async function POST(request: NextRequest) {
	const body = await request.json();
	const { uid, displayName, email, photoURL } = body as {
		uid: string;
		displayName: string;
		email: string;
		photoURL?: string;
	};

	const docRef = db.collection("users").doc(uid);
	const existing = await docRef.get();

	if (!existing.exists) {
		await docRef.set({
			displayName,
			email,
			photoURL: photoURL ?? null,
			totalPoints: 0,
		});
	}

	const data = (await docRef.get()).data() as Omit<User, "uid">;
	return NextResponse.json({ uid, ...data });
}
