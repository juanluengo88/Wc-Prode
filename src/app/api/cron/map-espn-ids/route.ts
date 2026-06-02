import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function normalizarFechaHora(isoString: string): string {
  if (!isoString) return "";
  return isoString.substring(0, 16); // "YYYY-MM-DDTHH:mm"
}

// Diccionario de traducción de respaldo ampliado para resolver las alertas restantes
const traductorPaises: { [key: string]: string } = {
  "brazil": "brasil",
  "scotland": "escocia",
  "southkorea": "coreadelsur",
  "korearepublic": "coreadelsur",
  "southafrica": "sudafrica",
  "sweden": "suecia",
  "japan": "japon",
  "netherlands": "paisesbajos",
  "tunisia": "tunez",
  "unitedstates": "estadosunidos",
  "usa": "estadosunidos",
  "turkey": "turquia",
  "france": "francia",
  "norway": "noruega",
  "saudiarabia": "arabiasaudita",
  "capeverde": "caboverde",
  "capeverdeislands": "caboverde",
  "belgium": "belgica",
  "newzealand": "nuevazelanda",
  "germany": "alemania",
  "spain": "espana",
  "morocco": "marruecos",
  "ivorycoast": "costademarfil",
  "ecuador": "ecuador",
  "curacao": "curazao",
  "czechia": "chequia",
  "czechrepublic": "chequia",
  // Nuevos países agregados desde tus alertas
  "qatar": "catar",
  "bosniaherzegovina": "bosniayherzegovina",
  "canada": "canada",
  "switzerland": "suiza",
  "iraq": "irak",
  "senegal": "senegal",
  "iran": "iran",
  "egypt": "egipto",
  "ghana": "ghana",
  "croatia": "croacia",
  "england": "inglaterra",
  "panama": "panama",
  "uzbekistan": "uzbekistan",
  "congodr": "rddelcongo",
  "drcongo": "rddelcongo",
  "austria": "austria",
  "algeria": "argelia"
};

export async function GET() {
  console.log("[Mapeador-Híbrido] Iniciando cruce con doble capa de validación...");

  try {
    const espnCalendarUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200&lang=es&region=ar";
    const espnResponse = await fetch(espnCalendarUrl, { cache: 'no-store' });
    
    if (!espnResponse.ok) {
      return NextResponse.json({ error: "No se pudo obtener el calendario completo de ESPN" }, { status: 500 });
    }
    
    const espnData = await espnResponse.json();
    const espnEvents = espnData?.events || [];

    const matchesSnapshot = await db.collection("matches").get();
    if (matchesSnapshot.empty) {
      return NextResponse.json({ error: "No hay partidos en Firestore" }, { status: 404 });
    }

    const tusPartidos = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const listosParaMapear: any[] = [];
    const revisarNombres: any[] = [];

    for (const espnEvent of espnEvents) {
      const juegoId = espnEvent.id;
      const espnFechaNormalizada = normalizarFechaHora(espnEvent.date); 

      // 1. Filtrado inicial por coincidencia estricta de Fecha y Hora
      const partidosMismaHora = tusPartidos.filter(p => normalizarFechaHora(p.dateTime) === espnFechaNormalizada);

      let tuPartidoCoincidente: any = null;

      // REGLA 1: Único partido en esa hora
      if (partidosMismaHora.length === 1) {
        tuPartidoCoincidente = partidosMismaHora[0];
      } 
      // REGLA 2: Bloques en simultáneo (Desempate avanzado)
      else if (partidosMismaHora.length > 1) {
        
        const detailUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${juegoId}&lang=es&region=ar`;
        
        try {
          const detailRes = await fetch(detailUrl, { cache: 'no-store' });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const teamsBoxscore = detailData?.boxscore?.teams || detailData?.teams || [];
            
            if (teamsBoxscore.length >= 2) {
              const localESPN = cleanText(teamsBoxscore[0]?.team?.displayName || teamsBoxscore[0]?.team?.name || "");
              const visitanteESPN = cleanText(teamsBoxscore[1]?.team?.displayName || teamsBoxscore[1]?.team?.name || "");

              // --- CAPA 1: BUSQUEDA NATIVA ANTERIOR (Sin traducción forzada) ---
              tuPartidoCoincidente = partidosMismaHora.find(p => {
                const tuLocal = cleanText(p.teamHome || "");
                const tuVisitante = cleanText(p.teamAway || "");

                const matchLocal = tuLocal.includes(localESPN) || localESPN.includes(tuLocal);
                const matchVisitante = tuVisitante.includes(visitanteESPN) || visitanteESPN.includes(tuVisitante);
                return matchLocal || matchVisitante; 
              });

              // --- CAPA 2: SI NO ENCONTRÓ, SINO SE ACTIVA EL TRANSLATE (Diccionario de respaldo) ---
              if (!tuPartidoCoincidente) {
                tuPartidoCoincidente = partidosMismaHora.find(p => {
                  let tuLocalTraducido = cleanText(p.teamHome || "");
                  let tuVisitanteTraducido = cleanText(p.teamAway || "");

                  if (traductorPaises[tuLocalTraducido]) tuLocalTraducido = traductorPaises[tuLocalTraducido];
                  if (traductorPaises[tuVisitanteTraducido]) tuVisitanteTraducido = traductorPaises[tuVisitanteTraducido];

                  const matchLocal = tuLocalTraducido === localESPN || tuLocalTraducido.includes(localESPN) || localESPN.includes(tuLocalTraducido);
                  const matchVisitante = tuVisitanteTraducido === visitanteESPN || tuVisitanteTraducido.includes(visitanteESPN) || visitanteESPN.includes(tuVisitanteTraducido);
                  return matchLocal && matchVisitante;
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error en la consulta del scraper para el juegoId ${juegoId}`);
        }
      }

      if (tuPartidoCoincidente) {
        listosParaMapear.push({
          tuFirestoreDocId: tuPartidoCoincidente.id,
          tuPartidoDB: `${tuPartidoCoincidente.teamHome} vs ${tuPartidoCoincidente.teamAway}`,
          fechaHoraSincronizada: espnFechaNormalizada,
          juegoIdESPN: juegoId,
          nombreESPN: espnEvent.name
        });

        
        await db.collection("matches").doc(tuPartidoCoincidente.id).update({ espnMatchId: juegoId });

      } else {
        revisarNombres.push({
          juegoIdESPN: juegoId,
          fechaHoraNormalizadaESPN: espnFechaNormalizada,
          nombreESPN: espnEvent.name,
          alerta: "No se pudo desempatar este bloque usando ninguna de las dos capas de validación."
        });
      }
    }

    return NextResponse.json({
      success: true,
      resumen: {
        totalPartidosESPN: espnEvents.length,
        emparejadosConExito: listosParaMapear.length,
        requierenRevision: revisarNombres.length
      },
      listadoMapeoDefinitivo: listosParaMapear,
      alertas: revisarNombres
    });

  } catch (error: any) {
    console.error("[Mapeador Error]:", error.message);
    return NextResponse.json({ error: "Error en el servidor", detalles: error.message }, { status: 500 });
  }
}