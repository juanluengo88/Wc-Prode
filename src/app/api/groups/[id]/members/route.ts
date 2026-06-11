import { NextResponse } from "next/server";
import { addUsersToGroup } from "@/services/groupService";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const { userIds } = await request.json();

		if (!id) {
			return NextResponse.json(
				{ error: "Missing parameter: id" },
				{ status: 400 },
			);
		}

		if (!Array.isArray(userIds) || userIds.length === 0) {
			return NextResponse.json(
				{ error: "userIds must be a non-empty array" },
				{ status: 400 },
			);
		}

		await addUsersToGroup(id, userIds);

		return NextResponse.json({
			success: true,
			message: `${userIds.length} usuario(s) agregado(s) al grupo.`,
		});
	} catch (error: any) {
		console.error("[API Add Members Error]:", error.message);
		return NextResponse.json(
			{ error: "No se pudieron agregar los usuarios", detalles: error.message },
			{ status: 500 },
		);
	}
}
