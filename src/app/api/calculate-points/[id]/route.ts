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
    const predictions = await getPredictionsByMatchId(id);

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se encontraron predicciones para procesar en este partido.",
      });
    }

   const batch = db.batch();
    let updatedCount = 0;
    
    for (const p of predictions) {
      const pointsEarned = assertPrediction(p, matchData);
      const predictionRef = db.collection("predictions").doc(p.uid);
      const docVerify = await predictionRef.get();

      if (!docVerify.exists) {
        console.warn(`[Cron Advertencia] El documento con ID ${p.uid} no existe físicamente en Firestore. Saltando...`);
        continue; 
      }

      // Si existe, lo añadimos al lote de forma segura
      batch.update(predictionRef, { pointsEarned: pointsEarned }); 

      const uidUsuario = p.userId;

      if (pointsEarned > 0 && uidUsuario) {
        const userRef = db.collection("users").doc(uidUsuario);
        const userVerify = await userRef.get();
        if (userVerify.exists) {
          batch.update(userRef, {
            totalPoints: FieldValue.increment(pointsEarned),
          });
        }
      }

      updatedCount++;
    }

    if (updatedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Puntos calculados y distribuidos con éxito en lote.`,
      matchId: id,
      processedPredictions: updatedCount,
    });

  } catch (error: any) {
    console.error("[Cron Puntos Error]:", error?.message || error);
    
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ 
        error: "Error de consistencia en la base de datos", 
        detalles: "Uno de los IDs de las predicciones procesadas no existe como documento real en Firestore. Revisa si guardaste el documento con el ID de la predicción o el del usuario." 
      }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Fallo crítico en el cron", detalles: error?.message },
      { status: 500 },
    );
  }
}