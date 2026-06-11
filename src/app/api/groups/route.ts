import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// Obtener todos los grupos
export async function GET() {
  try {
    const snapshot = await db.collection("groups").orderBy("name", "asc").get();
    
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al traer grupos", detalles: error.message }, { status: 500 });
  }
}