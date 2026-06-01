import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // ID del partido de tu captura
  const juegoId = "401864055"; 

  console.log(`[API-Scraper] Consultando feed para obtener jugadores e incidencias + formación...`);

  try {
    // API interna de datos oficiales de ESPN
    const urlTarget = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${juegoId}&lang=es&region=ar`;

    const response = await fetch(urlTarget, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ error: `ESPN API respondió con código ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // 1. EXTRAER JUGADORES Y FORMACIÓN TÁCTICA
    const titularesLocal: string[] = [];
    const titularesVisitante: string[] = [];
    
    // Variables de respaldo por si el feed de rosters no trae la formación explícita
    let formacionLocal = "N/A";
    let formacionVisitante = "N/A";

    const rosters = data?.rosters || [];
    
    // --- Equipo Local ---
    if (rosters[0]) {
      // Extraemos la formación táctica (ej: "4-4-2") desde el objeto del equipo si está disponible
      formacionLocal = rosters[0].formation || "N/A";
      
      if (rosters[0].roster) {
        rosters[0].roster.forEach((player: any) => {
          if (player.starter && titularesLocal.length < 11) {
            titularesLocal.push(player.athlete?.displayName || player.athlete?.shortName);
          }
        });
      }
    }

    // --- Equipo Visitante ---
    if (rosters[1]) {
      formacionVisitante = rosters[1].formation || "N/A";
      
      if (rosters[1].roster) {
        rosters[1].roster.forEach((player: any) => {
          if (player.starter && titularesVisitante.length < 11) {
            titularesVisitante.push(player.athlete?.displayName || player.athlete?.shortName);
          }
        });
      }
    }

    // RESPALDO: Si las propiedades internas cambian, buscamos la formación en el árbol boxscore alternativo
    if (formacionLocal === "N/A" || formacionVisitante === "N/A") {
      const teamsBoxscore = data?.boxscore?.teams || [];
      if (teamsBoxscore[0]?.formation) formacionLocal = teamsBoxscore[0].formation;
      if (teamsBoxscore[1]?.formation) formacionVisitante = teamsBoxscore[1].formation;
    }

    // 2. EXTRAER INCIDENCIAS EN VIVO
    const incidencias: any[] = [];
    const keyEvents = data?.keyEvents || [];

    keyEvents.forEach((event: any) => {
      const tiempo = event?.clock?.displayValue || `${event?.clock?.value}'` || "N/A";
      const descripcion = event?.text || "";
      let tipo = "comentario";

      const typeId = event?.type?.id;
      if (typeId === "1" || typeId === "10") {
        tipo = "gol";
      } else if (typeId === "2") {
        tipo = "tarjeta-amarilla";
      } else if (typeId === "3") {
        tipo = "tarjeta-roja";
      } else if (typeId === "11") {
        tipo = "cambio";
      }

      if (descripcion) {
        incidencias.push({ tiempo, descripcion, tipo });
      }
    });

    // 3. RETORNO DE DATOS TOTALMENTE COMPLETOS
    return NextResponse.json({
      juegoId,
      success: true,
      formaciones: {
        local: formacionLocal,       
        visitante: formacionVisitante 
      },
      titulares: {
        local: titularesLocal.length > 0 ? titularesLocal : ["Alineación no disponible"],
        visitante: titularesVisitante.length > 0 ? titularesVisitante : ["Alineación no disponible"]
      },
      eventosEnVivo: incidencias
    });

  } catch (error: any) {
    console.error("[API-Scraper Error]:", error.message);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}