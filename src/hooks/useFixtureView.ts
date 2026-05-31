// hooks/useFixtureView.ts
"use client";

import { useState, useEffect } from "react";
import { Match, Prediction } from "@/lib/mockData";

interface UseFixtureViewProps {
  matches: Match[];
  predictions: Prediction[];
}

export function useFixtureView({ matches, predictions }: UseFixtureViewProps) {
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Keep time updated every 10s
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  // Sync filteredMatches when matches prop changes
  useEffect(() => {
    setFilteredMatches(matches);
  }, [matches]);

  const isMatchLocked = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    const lockLimit = 15 * 60 * 1000;
    return matchTime - currentTime <= lockLimit;
  };

  const getPrediction = (matchId: string) =>
    predictions.find((p) => p.matchId === matchId);

  const getPointsBadgeColor = (points: number | null) => {
    if (points === 3) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (points === 1) return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    if (points === 0) return "bg-slate-800 text-slate-400 border border-slate-700/50";
    return "";
  };

  const teamsAreDefined = (match : Match) => {
    return Boolean(match.teamHome?.trim()) && Boolean(match.teamAway?.trim());
  }
  

  return {
    filteredMatches,
    setFilteredMatches,
    isMatchLocked,
    getPrediction,
    getPointsBadgeColor,
    teamsAreDefined
  };
}