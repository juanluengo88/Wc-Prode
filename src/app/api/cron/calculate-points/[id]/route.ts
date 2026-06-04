import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getMatchById } from "@/services/matchService";
import { getPredictionsByMatchId, updatePrediction } from "@/services/predictionService";
import { assertPrediction } from "@/services/calculationService";
import { FieldValue } from "firebase-admin/firestore"; // 👈 SUMA ESTA LÍNEA

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
    const predictions = await getPredictionsByMatchId(id);

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "No se encontraron predicciones para procesar en este partido.",
      });
    }

    
    const batch = db.batch();
    let updatedCount = 0;
    
    for (const p of predictions) {
      
      const pointsEarned = assertPrediction(p, matchData);

      await updatePrediction(p.uid, { pointsEarned: pointsEarned }) 

    
      const uidUsuario = p.userId ;

      if (pointsEarned > 0 && uidUsuario) {
        const userRef = db.collection("users").doc(uidUsuario);

        batch.update(userRef, {
          totalPoints: FieldValue.increment(pointsEarned),
        });
      }

      updatedCount++;
    }

    
    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Puntos calculados y distribuidos con éxito.`,
      matchId: id,
      processedPredictions: updatedCount,
    });
  } catch (error: any) {
    console.error("[Cron Puntos Error]:", error?.message || error);
    return NextResponse.json(
      { error: "Fallo crítico en el cron", detalles: error?.message },
      { status: 500 },
    );
  }
}
