import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { User } from "@/lib/mockData";

export const dynamic = "force-dynamic";
import { getUsers } from "@/services/userService";

// GET /api/users — sorted leaderboard
export async function GET() {
	try{
		const users =  await getUsers();
		
		return NextResponse.json(users);
	}catch(error){
		throw new Error('Error while fetching users')
	}
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

	if (existing.exists) {
		return NextResponse.json({ uid, ...(existing.data() as Omit<User, "uid">) });
	}

	const newUser = {
		displayName,
		email,
		photoURL: photoURL ?? null,
		totalPoints: 0,
	};
	await docRef.set(newUser);
	return NextResponse.json({ uid, ...newUser });
}
