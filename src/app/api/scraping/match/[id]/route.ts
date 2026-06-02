import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: juegoId } = await params;

  if (!juegoId) {
    return NextResponse.json({ error: "Falta el parámetro id del juego" }, { status: 400 });
  }

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

    // 1. EXTRAER INFORMACIÓN DE LOS EQUIPOS (¡NUEVO!)
    let nombreLocal = "No disponible";
    let nombreVisitante = "No disponible";
    let abbrevLocal = "";
    let abbrevVisitante = "";

    // Buscamos en la sección de equipos del boxscore
    const teamsBoxscore = data?.boxscore?.teams || data?.teams || [];
    if (teamsBoxscore[0]?.team) {
      nombreLocal = teamsBoxscore[0].team.displayName || teamsBoxscore[0].team.name || "Local";
      abbrevLocal = teamsBoxscore[0].team.abbreviation || "";
    }
    if (teamsBoxscore[1]?.team) {
      nombreVisitante = teamsBoxscore[1].team.displayName || teamsBoxscore[1].team.name || "Visitante";
      abbrevVisitante = teamsBoxscore[1].team.abbreviation || "";
    }

    // 2. EXTRAER JUGADORES Y FORMACIÓN TÁCTICA
    const titularesLocal: string[] = [];
    const titularesVisitante: string[] = [];
    let formacionLocal = "N/A";
    let formacionVisitante = "N/A";

    const rosters = data?.rosters || [];
    
    // Equipo Local
    if (rosters[0]) {
      formacionLocal = rosters[0].formation || teamsBoxscore[0]?.formation || "N/A";
      if (rosters[0].roster) {
        rosters[0].roster.forEach((player: any) => {
          if (player.starter && titularesLocal.length < 11) {
            titularesLocal.push(player.athlete?.displayName || player.athlete?.shortName);
          }
        });
      }
    }

    // Equipo Visitante
    if (rosters[1]) {
      formacionVisitante = rosters[1].formation || teamsBoxscore[1]?.formation || "N/A";
      if (rosters[1].roster) {
        rosters[1].roster.forEach((player: any) => {
          if (player.starter && titularesVisitante.length < 11) {
            titularesVisitante.push(player.athlete?.displayName || player.athlete?.shortName);
          }
        });
      }
    }

    // 3. EXTRAER INCIDENCIAS EN VIVO
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

    // 4. RESPUESTA JSON ENRIQUECIDA
    return NextResponse.json({
      juegoId,
      success: true,
      equipos: {
        local: {
          nombre: nombreLocal,        // 👈 "México"
          abreviacion: abbrevLocal    // 👈 "MEX"
        },
        visitante: {
          nombre: nombreVisitante,    // 👈 "Sudáfrica"
          abreviacion: abbrevVisitante// 👈 "RSA"
        }
      },
      formaciones: {
        local: formacionLocal,
        visitante: formacionVisitante
      },
      titulares: {
        local: titularesLocal,
        visitante: titularesVisitante
      },
      eventosEnVivo: incidencias
    });

  } catch (error: any) {
    console.error("[Scraper Error]:", error.message);
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
  }
}