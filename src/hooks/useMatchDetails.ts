import { useState, useEffect } from "react";

interface Odds {
  local: number | null;
  empate: number | null;
  visitante: number | null;
  tieneOdds: boolean;
}

interface FilaEstadistica {
  resultado: string;
  oponente: string;
  score: string;
  fecha: string;
  competencia?: string;
}

interface MatchDetailsData {
  success: boolean;
  partidoDB: {
    status: "SCHEDULED" | "LIVE" | "FINISHED";
    scoreHome: number | null;
    scoreAway: number | null;
  };
  detallesTacticos: {
    formacionHome: string;
    formacionAway: string;
    titularesHome: string[];
    titularesAway: string[];
  };
  probabilidadesPrediccion: Odds;
  previaEstadisticas: {
    rachaHome: FilaEstadistica[] | string;
    rachaAway: FilaEstadistica[] | string;
    historialH2H: any[];
  };
  eventosEnVivo: Array<{ tiempo: string; descripcion: string; tipo: string }>;
}

export function useMatchDetails(matchIdESPN: string | null | undefined) {
  const [data, setData] = useState<MatchDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchIdESPN) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Le pegamos a la API route on-demand que calibramos antes
        const res = await fetch(`/api/scraping/match/${matchIdESPN}`);
        if (!res.ok) throw new Error("Error al obtener estadísticas en tiempo real");
        
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("[useMatchDetails Error]:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [matchIdESPN]);

  return { data, loading, error };
}