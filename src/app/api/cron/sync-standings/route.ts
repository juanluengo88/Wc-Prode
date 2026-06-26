import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";

export async function PUT() {
  try {
    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "FOOTBALL_DATA_API_TOKEN not configured" },
        { status: 500 },
      );
    }

    const docRef = db.collection("meta").doc("standings");
    const stored = await docRef.get();
    const storedMatchday: number | null = stored.exists
      ? (stored.data()?.currentMatchday ?? null)
      : null;

    const [standingsRes, scorersRes] = await Promise.all([
      fetch(`${FOOTBALL_DATA_BASE}/competitions/WC/standings`, {
        headers: { "X-Auth-Token": token },
        cache: "no-store",
      }),
      fetch(`${FOOTBALL_DATA_BASE}/competitions/WC/scorers?limit=10`, {
        headers: { "X-Auth-Token": token },
        cache: "no-store",
      }),
    ]);

    if (!standingsRes.ok || !scorersRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch from football-data.org",
          standingsStatus: standingsRes.status,
          scorersStatus: scorersRes.status,
        },
        { status: 502 },
      );
    }

    const [standingsData, scorersData] = await Promise.all([
      standingsRes.json(),
      scorersRes.json(),
    ]);

    const newMatchday: number = standingsData.season?.currentMatchday;

    if (storedMatchday !== null && storedMatchday === newMatchday) {
      return NextResponse.json({
        success: true,
        message: `No changes — matchday still at ${newMatchday}`,
        skipped: true,
      });
    }

    await docRef.set({
      currentMatchday: newMatchday,
      season: standingsData.season,
      standings: standingsData.standings,
      scorers: scorersData.scorers,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `Standings synced — matchday ${storedMatchday ?? "none"} → ${newMatchday}`,
      skipped: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[sync-standings error]:", msg);
    return NextResponse.json(
      { error: "sync failed", details: msg },
      { status: 500 },
    );
  }
}
