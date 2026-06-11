// app/api/groups/user/[uid]/route.ts
import { NextResponse } from "next/server";
import { getLeaderboardByGroupId } from "@/services/groupService";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const leaderboard = await getLeaderboardByGroupId(id);

		return NextResponse.json({ success: true, leaderboard });
	} catch (error: any) {
		console.error("[API User Groups Error]:", error?.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}
