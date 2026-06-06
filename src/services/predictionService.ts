import { db } from "@/lib/firebaseAdmin";

export type Prediction = {
  uid: string;        
  matchId: string;     
  userId: string;      
  predictHome: number; 
  predictAway: number; 
  pointsEarned: number | null; 
  timestamp?: string;  
};

export async function getPredictionsByMatchId(matchId: string): Promise<Prediction[]> {
  const snapshot = await db
    .collection("predictions")
    .where("matchId", "==", matchId)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id, 
      matchId: data.matchId ?? "",
      userId: data.userId ?? data.uid ?? "", 
      predictHome: Number(data.predictHome ?? 0),
      predictAway: Number(data.predictAway ?? 0),
      pointsEarned: data.pointsEarned !== undefined ? data.pointsEarned : null,
    } as Prediction;
  });
}