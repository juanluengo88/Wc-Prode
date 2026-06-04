import { db } from "@/lib/firebaseAdmin";
import { Match } from "@/lib/mockData"; // 👈 IMPORTAMOS TU TIPO O INTERFAZ MATCH

/**
 * Busca un partido en la base de datos por su ID único de documento
 * @param id ID del partido en Firestore
 * @returns Promesa que resuelve estrictamente en un objeto de tipo Match
 */
export async function getMatchById(id: string): Promise<Match> {
  const docRef = db.collection("matches").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Match not found");
  }

  const data = docSnap.data();

  
  return {
    matchId: docSnap.id, 
    teamHome: data?.teamHome ?? "",
    teamAway: data?.teamAway ?? "",
    scoreHome: data?.scoreHome !== undefined ? data.scoreHome : null,
    scoreAway: data?.scoreAway !== undefined ? data.scoreAway : null,
    status: data?.status ?? "SCHEDULED",
    dateTime: data?.dateTime ?? "",
    groupOrStage: data?.groupOrStage ?? "",
    teamHomeFlag: data?.teamHomeFlag ?? "",
    teamAwayFlag: data?.teamAwayFlag ?? "",
    idESPN: data?.idESPN ?? null,
    ...data 
  } as Match;
}