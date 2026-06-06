import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function espnScrapperFetching(idESPN: string) {
  const urlTarget = `${APP_URL}/api/scraping/match/${idESPN}`;
  
  const response = await fetch(urlTarget, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", 
  });

  if (!response.ok) {
    throw new Error(`Error  Scraping API (Status ${response.status}) for the EspnId: ${idESPN}`);
  }

  return await response.json();
}

export async function PUT(request: Request) {
  try {
    const now = new Date();
    
    const anHourInTheFuture = new Date(now.getTime() + 60 * 60 * 1000);

    const matchesSnapshot = await db
      .collection("matches")
      .where("status", "in", ["SCHEDULED", "LIVE"])
      .get();


    
    if (matchesSnapshot.empty) {
      return NextResponse.json({ success: true, message: "No actives matches to sync" });
    }

    const batch = db.batch();
    let editedMatches = 0;

    
    for (const doc of matchesSnapshot.docs) {
      const match = doc.data();
      const matchTime = new Date(match.dateTime);
      const idESPN = match.espnMatchId;

      
      if (match.status === "SCHEDULED" && matchTime > anHourInTheFuture) {
        continue; 
      }

      if (!idESPN) {
        console.warn(`[Cron Scraper Warning] the match ${doc.id} (${match.teamHome} vs ${match.teamAway}) is active but doesnt have 'idESPN' mapped in the db`);
        continue;
      }
  
      try {
        
        const dataESPN = await espnScrapperFetching(idESPN);
        const newHomeScore = dataESPN.scoreHome;
        const newAwayScore = dataESPN.scoreAway;
        const newState = dataESPN.status;

        
        if (
          newState !== match.status ||
          newHomeScore !== match.scoreHome ||
          newAwayScore !== match.scoreAway
        ) {
          const matchRef = db.collection("matches").doc(doc.id);
          
          batch.update(matchRef, {
            scoreHome: newHomeScore !== undefined ? Number(newHomeScore) : null,
            scoreAway: newAwayScore !== undefined ? Number(newAwayScore) : null,
            status: newState,
            lastScrapedAt: FieldValue.serverTimestamp()
          });

          editedMatches++;

          if (newState === "FINISHED") {
            

            fetch(`${APP_URL}/api/cron/calculate-points/${doc.id}`, { 
              method: "POST",
              cache: "no-store"
            }).catch(err => console.error(`[Cron Scraper Error] trigger failed ${doc.id}:`, err));
          }
        }
      } catch (scrapError: any) {
        console.error(`[Cron Scraper Error match] failed to scrap ${idESPN}:`, scrapError?.message || scrapError);
      }
    }

    if (editedMatches > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Update completed.  ${editedMatches} matches affected `,
    });

  } catch (error: any) {
    console.error("[ General Cron Scraper Error ]:", error?.message || error);
    return NextResponse.json({ error: "sync failed", detalles: error?.message }, { status: 500 });
  }
}