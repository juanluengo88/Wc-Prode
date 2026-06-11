import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	try {
		if (!id) {
			return NextResponse.json(
				{ error: "Missing parameter: id" },
				{ status: 400 },
			);
		}
		await db.collection("groups").doc(id).delete();
		return NextResponse.json({
			success: true,
			message: `Group ${id} deleted`,
		});
	} catch (error: any) {
		return NextResponse.json(
			{ error: "Error al eliminar grupo", detalles: error.message },
			{ status: 500 },
		);
	}
}
