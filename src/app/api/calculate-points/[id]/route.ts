import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getMatchById } from "@/services/matchService";
import { getPredictionsByMatchId } from "@/services/predictionService";
import { assertPrediction } from "@/services/calculationService";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const matchData = await getMatchById(id);

  
    if ((matchData as any).pointsCalculated === true) {
      return NextResponse.json({
        success: false,
        error: "Blocked Operation",
        detalles: `The points from the match (${id}) were previusly assigned. They can only be assigned once.`
      }, { status: 200 });
    }

    const predictions = await getPredictionsByMatchId(id);

    const batch = db.batch();
    
    
    if (!predictions || predictions.length === 0) {
      const matchRef = db.collection("matches").doc(id);
      await matchRef.update({
        status: "FINISHED",
        pointsCalculated: true,
        pointsCalculatedAt: FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        success: true,
        message: "Partido finalizado. No se encontraron predicciones para procesar.",
      });
    }

    let updatedCount = 0;

    for (const p of predictions) {
      const pointsEarned = assertPrediction(p, matchData);
      const predictionRef = db.collection("predictions").doc(p.uid);

      batch.update(predictionRef, { pointsEarned });

      const uidUsuario = p.userId;

      if (pointsEarned > 0 && uidUsuario) {
        const userRef = db.collection("users").doc(uidUsuario);
        batch.update(userRef, {
          totalPoints: FieldValue.increment(pointsEarned),
        });
      }

      updatedCount++;
    }

    
    const matchRef = db.collection("matches").doc(id);
    batch.update(matchRef, {
      status: "FINISHED",                       
      pointsCalculated: true,                   
      pointsCalculatedAt: FieldValue.serverTimestamp() 
    });

   
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Puntos calculados, distribuidos en lote y partido cerrado exitosamente.`,
      matchId: id,
      processedPredictions: updatedCount,
    });

  } catch (error: any) {
    console.error("[Cron Puntos Error]:", error?.message || error);
    
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ 
        error: "Error de consistencia en la base de datos", 
        detalles: "Uno de los IDs de las predicciones procesadas no existe como documento real en Firestore." 
      }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Fallo crítico en el cron", detalles: error?.message },
      { status: 500 },
    );
  }
}