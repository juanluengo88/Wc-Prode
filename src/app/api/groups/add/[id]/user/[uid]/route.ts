import { NextResponse } from "next/server";
// 🌟 Asegurate de importar la función correcta basada en tu modelo de datos
import { addUserToGroup } from "@/services/groupService"; 

export async function POST(
  request: Request,
  { params }: { params: { id: string; uid: string } } 
) {
  try {
    
    const { id, uid } = await params;

    if (!uid || !id) {
      return NextResponse.json(
        { error: "Los parámetros 'uid' y 'id' en la URL son obligatorios." }, 
        { status: 400 }
      );
    }
    await addUserToGroup(id, uid);

    return NextResponse.json({ 
      success: true, 
      message: "¡Te has unido al grupo exitosamente!" 
    });

  } catch (error: any) {
    console.error("[Join Group API Error]:", error);
    return NextResponse.json(
      { error: "Error interno al unirse al grupo", detalles: error.message }, 
      { status: 500 }
    );
  }
}