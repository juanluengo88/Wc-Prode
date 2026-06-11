import { NextResponse } from "next/server";
import { createGroup } from "@/services/groupService";

export async function POST(request: Request) {
  try {
    const { name, creatorUid } = await request.json();

    if (!name || !creatorUid) {
      return NextResponse.json({ error: "Missing parameters (name, creatorUid)" }, { status: 400 });
    }

    const group= await createGroup(name, creatorUid);

    return NextResponse.json({
      success: true,
      message: "Group successfuly created.",
      group,
    }, {status : 201});

  } catch (error: any) {
    console.error("[API Create Group Error]:", error?.message);
    return NextResponse.json({ error: "No se pudo crear el grupo", detalles: error?.message }, { status: 500 });
  }
}