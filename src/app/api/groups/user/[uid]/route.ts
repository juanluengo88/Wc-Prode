// app/api/groups/user/[uid]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { findById } from "@/services/groupService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;

    const groups = findById(uid);

  
    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    console.error("[API User Groups Error]:", error?.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}