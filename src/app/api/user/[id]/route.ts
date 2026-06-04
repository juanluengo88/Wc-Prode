import { NextResponse } from "next/server";
import { getUserById } from "@/services/userService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
    }

    // Ejecutamos el helper asíncrono
    const userData = await getUserById(id);

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error: any) {
    console.error("[Get User Error]:", error?.message || error);

    if (error?.message === "User not found") {
      return NextResponse.json({ error: "El usuario no existe en la base de datos" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error interno al buscar el usuario", detalles: error?.message },
      { status: 500 }
    );
  }
}