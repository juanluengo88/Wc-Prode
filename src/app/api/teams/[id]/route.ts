import { db } from "@/lib/firebaseAdmin"; 
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    const docRef = db.collection("teams").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const data = docSnap.data();

    const responseData = { id: docSnap.id, ...data };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}