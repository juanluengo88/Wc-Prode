import { NextResponse } from "next/server";

// Función matemática corregida y blindada para cuotas americanas
function cuotaAmericana(moneyLine: number): number {
  if (!moneyLine || isNaN(moneyLine)) return 0;

  if (moneyLine > 0) {
    return 100 / (moneyLine + 100);
  } else {
    // Si es negativo (ej: -1000), el favorito.
    // Fórmula: |ML| / (|ML| + 100)
    const absoluto = Math.abs(moneyLine);
    return absoluto / (absoluto + 100);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: juegoId } = await params;

  if (!juegoId) {
    return NextResponse.json(
      { error: "Falta el parámetro id del juego" },
      { status: 400 },
    );
  }

  const fetchOptions = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "es-ES,es;q=0.9",
    },
    cache: "no-store" as RequestCache,
  };

  try {
    console.log(`[Proxy-API-Calibrado] Procesando juegoId: ${juegoId}`);

    const urlTargetAPI = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${juegoId}&lang=es&region=ar`;
    const responseAPI = await fetch(urlTargetAPI, fetchOptions);

    if (!responseAPI.ok) {
      return NextResponse.json(
        { error: `La API de ESPN respondió con código ${responseAPI.status}` },
        { status: responseAPI.status },
      );
    }

    const data = await responseAPI.json();

    
    // 1. MAPEAMOS LA INFORMACIÓN BÁSICA DEL PARTIDO
    let teamHome = "No disponible";
    let teamAway = "No disponible";
    let scoreHome: number | null = null;
    let scoreAway: number | null = null;
    let status = "SCHEDULED";
    let dateTimeISO = "";

    const apiStatusState = data?.header?.competitions?.[0]?.status?.type?.state;
    if (apiStatusState === "in") status = "LIVE";
    else if (apiStatusState === "post") status = "FINISHED";
    else status = "SCHEDULED";

    dateTimeISO = data?.header?.competitions?.[0]?.date || "";

    const competitors = data?.header?.competitions?.[0]?.competitors || [];
    const homeTeamData = competitors.find((t: any) => t.homeAway === "home");
    const awayTeamData = competitors.find((t: any) => t.homeAway === "away");

    if (homeTeamData) {
      teamHome = homeTeamData.team?.displayName || "Home";
      scoreHome =
        homeTeamData.score !== undefined ? parseInt(homeTeamData.score) : null;
    }
    if (awayTeamData) {
      teamAway = awayTeamData.team?.displayName || "Away";
      scoreAway =
        awayTeamData.score !== undefined ? parseInt(awayTeamData.score) : null;
    }

    // 2. PARSEO DE ESTADÍSTICAS (RACHAS INDIVIDUALES DESDE BOXSCORE.FORM)
    const rachaHome: any[] = [];
    const rachaAway: any[] = [];
    const historialH2H: any[] = [];

    const formLogs = data?.boxscore?.form || [];

    // Racha del Local
    const logLocal = formLogs.find(
      (l: any) => l.team?.homeAway === "home" || l.displayOrder === 1,
    );
    if (logLocal?.events) {
      logLocal.events.slice(0, 5).forEach((event: any) => {
        rachaHome.push({
          resultado: event.gameResult || "-",
          oponente: event.opponent?.displayName || "Rival",
          score: event.score || `${event.homeTeamScore}-${event.awayTeamScore}`,
          fecha: event.gameDate ? event.gameDate.split("T")[0] : "N/A",
          competencia: event.competitionName || "Amistoso",
        });
      });
    }

    // Racha del Visitante
    const logVisitante = formLogs.find(
      (l: any) => l.team?.homeAway === "away" || l.displayOrder === 2,
    );
    if (logVisitante?.events) {
      logVisitante.events.slice(0, 5).forEach((event: any) => {
        rachaAway.push({
          resultado: event.gameResult || "-",
          oponente: event.opponent?.displayName || "Rival",
          score: event.score || `${event.homeTeamScore}-${event.awayTeamScore}`,
          fecha: event.gameDate ? event.gameDate.split("T")[0] : "N/A",
          competencia: event.competitionName || "Amistoso",
        });
      });
    }

    // 3. PARSEO DEL HISTORIAL MUTUO (H2H)
    const generalH2H = data?.headToHeadGames?.[0]?.events || [];
    generalH2H.slice(0, 5).forEach((event: any) => {
      const gLocal = parseInt(event.homeTeamScore || "0");
      const gAway = parseInt(event.awayTeamScore || "0");
      const nombreLocalPartido =
        event.homeTeamId === logLocal?.team?.id ? teamHome : teamAway;
      const nombreAwayPartido =
        event.awayTeamId === logLocal?.team?.id ? teamHome : teamAway;

      let ganador = "Empate";
      if (gLocal > gAway) ganador = nombreLocalPartido;
      else if (gAway > gLocal) ganador = nombreAwayPartido;

      historialH2H.push({
        fecha: event.gameDate ? event.gameDate.split("T")[0] : "N/A",
        partido: `${nombreLocalPartido} ${event.homeTeamScore} - ${event.awayTeamScore} ${nombreAwayPartido}`,
        score: event.score || `${event.homeTeamScore}-${event.awayTeamScore}`,
        competencia: event.competitionName || "Historial Reciente",
        ganador: ganador,
      });
    });

    // 4. ALINEACIONES Y PLANTELES TITULARES
    const titularesHome: string[] = [];
    const titularesAway: string[] = [];
    const rosters = data?.rosters || [];

    let defHome = 0,
      medHome = 0,
      delHome = 0;
    let defAway = 0,
      medAway = 0,
      delAway = 0;

    const rosterHome = rosters.find((r: any) => r.homeAway === "home");
    if (rosterHome?.roster) {
      rosterHome.roster.forEach((p: any) => {
        if (p.starter && titularesHome.length < 11) {
          titularesHome.push(p.athlete?.displayName || p.athlete?.shortName);
          const pos = (p.position?.name || "").toLowerCase();
          const displayNamePos = (p.position?.displayName || "").toLowerCase();

          if (pos.includes("def") || displayNamePos.includes("def")) defHome++;
          else if (
            pos.includes("mid") ||
            pos.includes("med") ||
            pos.includes("cen") ||
            displayNamePos.includes("med")
          )
            medHome++;
          else if (
            pos.includes("for") ||
            pos.includes("del") ||
            pos.includes("atac") ||
            displayNamePos.includes("del")
          )
            delHome++;
        }
      });
    }

    const rosterAway = rosters.find((r: any) => r.homeAway === "away");
    if (rosterAway?.roster) {
      rosterAway.roster.forEach((p: any) => {
        if (p.starter && titularesAway.length < 11) {
          titularesAway.push(p.athlete?.displayName || p.athlete?.shortName);
          const pos = (p.position?.name || "").toLowerCase();
          const displayNamePos = (p.position?.displayName || "").toLowerCase();

          if (pos.includes("def") || displayNamePos.includes("def")) defAway++;
          else if (
            pos.includes("mid") ||
            pos.includes("med") ||
            pos.includes("cen") ||
            displayNamePos.includes("med")
          )
            medAway++;
          else if (
            pos.includes("for") ||
            pos.includes("del") ||
            pos.includes("atac") ||
            displayNamePos.includes("del")
          )
            delAway++;
        }
      });
    }

    // 5. CAPA RED DE SEGURIDAD EN CASCADA PARA LAS FORMACIONES TÁCTICAS
    let formacionHome = data?.boxscore?.teams?.find(
      (t: any) => t.homeAway === "home",
    )?.formation;
    let formacionAway = data?.boxscore?.teams?.find(
      (t: any) => t.homeAway === "away",
    )?.formation;

    if (!formacionHome) formacionHome = rosterHome?.formation;
    if (!formacionAway) formacionAway = rosterAway?.formation;

    if (!formacionHome && defHome > 0)
      formacionHome = `${defHome}-${medHome}-${delHome}`;
    else if (!formacionHome) formacionHome = "N/A";

    if (!formacionAway && defAway > 0)
      formacionAway = `${defAway}-${medAway}-${delAway}`;
    else if (!formacionAway) formacionAway = "N/A";

   // 6. 📊 PROCESAMIENTO SEGURO Y NORMALIZADO DE ODDS (PRO-TUNING AMERICANO 🌟)
    let probabilidadesProde: {
      local: number | null;
      empate: number | null;
      visitante: number | null;
      tieneOdds: boolean;
    } = {
      local: null,
      empate: null,
      visitante: null,
      tieneOdds: false
    };

    const oddsData = data?.odds?.[0];

    if (oddsData) {
      // Función interna para extraer el número limpio sin importar si ESPN lo manda como objeto, string o número puro
      const extraerCuotaLimpia = (nodoTeam: any, nodoRaizFallback?: any): number => {
        // 1. Intentamos buscar el string americano con signo (ej: "+160" o "-210") en current u open
        const americanStr = nodoTeam?.current?.moneyLine?.american ?? nodoTeam?.open?.moneyLine?.american ?? nodoRaizFallback?.current?.moneyLine?.american ?? nodoRaizFallback?.open?.moneyLine?.american;
        if (americanStr) {
          return Number(americanStr.replace("+", ""));
        }
        // 2. Si no existe, buscamos el valor numérico directo (moneyLine puro o .value)
        const valorNumerico = nodoTeam?.current?.moneyLine?.value ?? nodoTeam?.moneyLine ?? nodoRaizFallback?.current?.moneyLine?.value ?? nodoRaizFallback?.moneyLine;
        return Number(valorNumerico);
      };

      // Extracción asimétrica basada exactamente en tu JSON
      const mlLocal = extraerCuotaLimpia(oddsData?.homeTeamOdds, oddsData);
      const mlVisitante = extraerCuotaLimpia(oddsData?.awayTeamOdds);
      
      // El empate en ESPN suele venir directo como número en drawOdds.moneyLine o en open.draw.moneyLine.american
      const empateRaw = oddsData?.drawOdds?.moneyLine ?? oddsData?.open?.draw?.moneyLine ?? oddsData?.current?.draw?.moneyLine;
      const empateAmericanStr = oddsData?.open?.draw?.moneyLine?.american ?? oddsData?.current?.draw?.moneyLine?.american;
      const mlEmpate = empateAmericanStr ? Number(empateAmericanStr.replace("+", "")) : Number(empateRaw);

      // Validamos que los tres números sean válidos y que no se hayan quedado en 0 o NaN
      if (!isNaN(mlLocal) && !isNaN(mlEmpate) && !isNaN(mlVisitante) && mlLocal !== 0 && mlEmpate !== 0 && mlVisitante !== 0) {
        
        // Aplicamos la fórmula matemática de probabilidad implícita americana
        const probLocalCruda = mlLocal > 0 ? (100 / (mlLocal + 100)) : (Math.abs(mlLocal) / (Math.abs(mlLocal) + 100));
        const probEmpateCruda = mlEmpate > 0 ? (100 / (mlEmpate + 100)) : (Math.abs(mlEmpate) / (Math.abs(mlEmpate) + 100));
        const probVisitanteCruda = mlVisitante > 0 ? (100 / (mlVisitante + 100)) : (Math.abs(mlVisitante) / (Math.abs(mlVisitante) + 100));

        const sumaCruda = probLocalCruda + probEmpateCruda + probVisitanteCruda;

        if (sumaCruda > 0) {
          probabilidadesProde = {
            local: parseFloat(((probLocalCruda / sumaCruda) * 100).toFixed(1)),
            empate: parseFloat(((probEmpateCruda / sumaCruda) * 100).toFixed(1)),
            visitante: parseFloat(((probVisitanteCruda / sumaCruda) * 100).toFixed(1)),
            tieneOdds: true
          };
        }
      }
    }
    // 7. CRONOLOGÍA DE INCIDENCIAS EN VIVO
    const incidencias: any[] = [];
    const keyEvents = data?.keyEvents || [];
    keyEvents.forEach((event: any) => {
      const tiempo = event?.clock?.displayValue || `${event?.clock?.value}'`;
      const descripcion = event?.text || "";
      let tipo = "comentario";

      const typeSlug = event?.type?.type || "";
      if (typeSlug.includes("goal")) tipo = "gol";
      else if (typeSlug === "yellow-card") tipo = "tarjeta-amarilla";
      else if (typeSlug === "red-card") tipo = "tarjeta-roja";
      else if (typeSlug === "substitution") tipo = "cambio";

      if (descripcion) incidencias.push({ tiempo, descripcion, tipo });
    });

    // --- 8. RETORNO DE LA RESPUESTA ---
    return NextResponse.json({
      success: true,
      juegoIdESPN: juegoId,
      timestampQuery: new Date().toISOString(),
      partidoDB: {
        teamHome,
        teamAway,
        scoreHome,
        scoreAway,
        status,
        dateTime: dateTimeISO,
      },
      detallesTacticos: {
        formacionHome,
        formacionAway,
        titularesHome,
        titularesAway,
      },
      probabilidadesPrediccion: probabilidadesProde,
      previaEstadisticas: {
        rachaHome,
        rachaAway,
        historialH2H,
      },
      eventosEnVivo: incidencias,
    });
  } catch (error: any) {
    console.error("[Scraper-Native-Error]:", error.message);
    return NextResponse.json(
      {
        error: "Fallo crítico al parsear el JSON nativo",
        detalles: error.message,
      },
      { status: 500 },
    );
  }
}
