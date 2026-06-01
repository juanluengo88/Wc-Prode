import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // ID del partido de tu captura (puedes volverlo dinámico después)
  const juegoId = "401864055"; 

  console.log(`[API-Scraper] Consultando feed oficial para el juegoId: ${juegoId}...`);

  try {
    // URL de la API interna de eventos de ESPN (Pública y en formato JSON nativo)
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

    // 1. EXTRAER ALINEACIONES TITULARES
    const titularesLocal: string[] = [];
    const titularesVisitante: string[] = [];

    // Buscamos dentro de la estructura de rosters de la API de ESPN
    const rosters = data?.rosters || [];
    
    // El primer equipo del array suele ser el Local y el segundo el Visitante
    if (rosters[0]?.roster) {
      // Filtramos únicamente a los que iniciaron el partido (titulares)
      rosters[0].roster.forEach((player: any) => {
        if (player.starter && titularesLocal.length < 11) {
          titularesLocal.push(player.athlete?.displayName || player.athlete?.shortName);
        }
      });
    }

    if (rosters[1]?.roster) {
      rosters[1].roster.forEach((player: any) => {
        if (player.starter && titularesVisitante.length < 11) {
          titularesVisitante.push(player.athlete?.displayName || player.athlete?.shortName);
        }
      });
    }

    // 2. EXTRAER INCIDENCIAS EN VIVO (Goles, Tarjetas, Cambios)
    const incidencias: any[] = [];
    const keyEvents = data?.keyEvents || [];

    keyEvents.forEach((event: any) => {
      const tiempo = event?.clock?.displayValue || `${event?.clock?.value}'` || "N/A";
      const descripcion = event?.text || "";
      let tipo = "comentario";

      // Clasificamos según el ID de tipo de evento que maneja la API de ESPN
      const typeId = event?.type?.id;
      
      if (typeId === "1" || typeId === "10") { // IDs típicos de goles
        tipo = "gol";
      } else if (typeId === "2") {
        tipo = "tarjeta-amarilla";
      } else if (typeId === "3") {
        tipo = "tarjeta-roja";
      } else if (typeId === "11") {
        tipo = "cambio";
      }

      if (descripcion) {
        incidencias.push({
          tiempo,
          descripcion,
          tipo
        });
      }
    });

    // 3. RETORNO DE LOS DATOS TOTALMENTE LIMPIOS
    return NextResponse.json({
      juegoId,
      success: true,
      apiFeedSource: "ESPN-Internal-API",
      titulares: {
        local: titularesLocal.length > 0 ? titularesLocal : ["Alineación titular no cargada en el feed"],
        visitante: titularesVisitante.length > 0 ? titularesVisitante : ["Alineación titular no cargada en el feed"]
      },
      eventosEnVivo: incidencias
    });

  } catch (error: any) {
    console.error("[API-Scraper Error]:", error.message);
    return NextResponse.json({ 
      error: "Error interno al procesar el feed de datos",
      details: error.message 
    }, { status: 500 });
  }
}