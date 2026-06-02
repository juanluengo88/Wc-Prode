"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/lib/mockData";

interface UseFixtureViewProps {
  matches: Match[];
  predictions: Prediction[];
}

export function useFixtureView({ matches, predictions }: UseFixtureViewProps) {
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // Mantener el tiempo actualizado cada 10 segundos (Crucial para el bloqueo dinámico)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  // Sincronizar filteredMatches de forma segura cuando la propiedad 'matches' real cambie desde el backend
  useEffect(() => {
    setFilteredMatches(matches);
  }, [matches]);

  // Bloquea la tarjeta si faltan 15 minutos o menos para el pitazo inicial
  const isMatchLocked = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    const lockLimit = 15 * 60 * 1000; // 15 minutos en milisegundos
    return matchTime - currentTime <= lockLimit;
  };

  // Busca el pronóstico guardado por el usuario para este partido en particular
  const getPrediction = (matchId: string) =>
    predictions.find((p) => p.matchId === matchId);

  // Devuelve los estilos exactos de Tailwind basados en los puntos que otorgó el validador del Prode
  const getPointsBadgeColor = (points: number | null) => {
    if (points === 3) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"; // Resultado exacto
    if (points === 1) return "bg-sky-500/20 text-sky-400 border border-sky-500/30"; // Acertó ganador / empate
    if (points === 0) return "bg-slate-800 text-slate-400 border border-slate-700/50";     // No sumó puntos
    return "";
  };

  // Valida si los equipos ya fueron definidos (Falso si todavía muestra los TBD de llaves de eliminación directa)
  const teamsAreDefined = (match: Match) => {
    return Boolean(match.teamHome?.trim()) && Boolean(match.teamAway?.trim());
  };

  return {
    filteredMatches,
    setFilteredMatches,
    isMatchLocked,
    getPrediction,
    getPointsBadgeColor,
    teamsAreDefined
  };
}