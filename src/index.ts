import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";


const APP_URL = process.env.APP_URL || "http://localhost:3000" ;

export const idEspnMapping = onSchedule("0 3 * * *", async () => {
  logger.log("🤖 Espn cron awake");
  
  try {

    const response = await fetch(`${APP_URL}/api/cron/map-espn-ids`, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`Next.js responded with status ${response.status}`);
    }

    logger.log("✅ Matches successfully mapped with espn ids");
  } catch (error) {
    logger.error("❌ An error occurred while executing cron idEspnMapping", error);
  }
});


export const updateActiveMatches = onSchedule("*/5 * * * *", async () => {
  logger.log("⏰ Cron started: syncing live matches...");
  
  try {
    
    const response = await fetch(`${APP_URL}/api/cron/sync-live-matches`, { cache: "no-store" });
    
    if (!response.ok) {
      throw new Error(`Next.js responded with status ${response.status}`);
    }

    const data = await response.json(); 

    logger.log("✅ Matches successfully updated", data);
  } catch (error) {
    logger.error("❌ An error occurred while executing cron updateActiveMatches", error);
  }
});