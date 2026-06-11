import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

import { createGroup } from "@/services/groupService";

// Obtener todos los grupos
export async function GET() {
	try {
		const snapshot = await db.collection("groups").orderBy("name", "asc").get();

		const groups = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		return NextResponse.json({ success: true, groups });
	} catch (error: any) {
		return NextResponse.json(
			{ error: "Error al traer grupos", detalles: error.message },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const { name, creatorUid } = await request.json();

		if (!name || !creatorUid) {
			return NextResponse.json(
				{ error: "Missing parameters (name, creatorUid)" },
				{ status: 400 },
			);
		}

		const group = await createGroup(name, creatorUid);

		return NextResponse.json(
			{
				success: true,
				message: "Group successfuly created.",
				group,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("[API Create Group Error]:", error?.message);
		return NextResponse.json(
			{ error: "No se pudo crear el grupo", detalles: error?.message },
			{ status: 500 },
		);
	}
}
