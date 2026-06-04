import { NextResponse } from "next/server";
import {getMatchById} from "@/services/matchService";
import { getPredictionsByMatchId } from "@/services/predictionService";
import { Prediction } from "@/lib/mockData";



export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let userId;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const matchData = await getMatchById(id);

   
    
    const predictions = await getPredictionsByMatchId(id)
    
    predictions.forEach(p => {
        userId = p.uid;
    });
    

    return NextResponse.json({ 
      success: true, 
      userId
    });


  } catch (error: any) {
    console.error("[Cron Puntos Error]:", error?.message || error);
    return NextResponse.json({ error: "Fallo crítico en el cron", detalles: error?.message }, { status: 500 });
  }
}