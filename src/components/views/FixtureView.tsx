"use client";

import React, { useState, useEffect } from "react";
import { Match, Prediction, User } from "../../lib/mockData";
import MotivanationalBanner from "@/lib/MotivationalBanner";
import { useServerTime } from "@/hooks/useServerTime";
import MatchCard from "@/lib/MatchCard";
import FixtureNavBar from "@/lib/FixtureNavBar";

interface FixtureViewProps {
  user: User;
  matches: Match[];
  predictions: Prediction[];
  onSavePrediction: (
    matchId: string,
    predictHome: number,
    predictAway: number,
  ) => Promise<void>;
  onSelectMatch: (matchId: string) => void;
  onLogout: () => void;
}

export default function FixtureView({
  user,
  matches,
  predictions,
  onSavePrediction,
  onSelectMatch,
  onLogout,
}: FixtureViewProps) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "LIVE" | "FINISHED">(
    "ALL",
  );
  const [localScores, setLocalScores] = useState<{
    [matchId: string]: { home: string; away: string };
  }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const getTime = useServerTime();
  const [currentTime, setCurrentTime] = useState(0);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);

  // Keep time updated using server-anchored clock (immune to local clock changes)
  useEffect(() => {
    const tick = () => setCurrentTime(getTime());
    tick();
    const timer = setInterval(tick, 10_000);
    return () => clearInterval(timer);
  }, [getTime]);

  // Pre-populate input fields with existing predictions
  useEffect(() => {
    const initialScores: typeof localScores = {};
    predictions.forEach((p) => {
      initialScores[p.matchId] = {
        home: p.predictHome.toString(),
        away: p.predictAway.toString(),
      };
    });
    const apply = () => setLocalScores(initialScores);
    apply();
  }, [predictions]);

  // Utility to determine lock status
  const isMatchLocked = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    const lockLimit = 15 * 60 * 1000; // 15 minutes in ms
    return matchTime - currentTime <= lockLimit;
  };

  const handleInputChange = (
    matchId: string,
    team: "home" | "away",
    value: string,
  ) => {
    // Only allow positive integers
    if (value !== "" && !/^\d+$/.test(value)) return;

    setLocalScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSave = async (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation(); // Avoid opening match details when clicking save

    const scores = localScores[matchId];
    if (!scores || scores.home === "" || scores.away === "") return;

    setSavingId(matchId);

    try {
      await onSavePrediction(
        matchId,
        parseInt(scores.home),
        parseInt(scores.away),
      );
      setSavingId(null);
      setSuccessId(matchId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch {
      setSavingId(null);
    }
  };

  const getPointsBadgeColor = (points: number | null) => {
    if (points === 3)
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (points === 1)
      return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    if (points === 0)
      return "bg-slate-800 text-slate-400 border border-slate-700/50";
    return "";
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-8 space-y-8">
        <MotivanationalBanner></MotivanationalBanner>

        <FixtureNavBar
          matches={matches}
          onFilteredMatchesChange={setFilteredMatches}
        />

        {/* Fixture Grid */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-slate-600 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <p className="text-slate-400 font-medium">
              No hay partidos en esta categoría en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match) => {
              const pred = predictions.find((p) => p.matchId === match.matchId);
              const locked =
                isMatchLocked(match.dateTime) || match.status !== "SCHEDULED";

              const homeVal = localScores[match.matchId]?.home ?? "";
              const awayVal = localScores[match.matchId]?.away ?? "";
              const isFormComplete = homeVal !== "" && awayVal !== "";

              // Format date in Spanish
              const dateObj = new Date(match.dateTime);
              const formattedDate = dateObj
                .toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
                .replace(".", "");
              const formattedTime = dateObj.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <MatchCard
                  key={match.matchId}
                  match={match}
                  pred={pred}
                  locked={locked}
                  homeVal={homeVal}
                  awayVal={awayVal}
                  savingId={savingId}
                  successId={successId}
                  isFormComplete={isFormComplete}
                  onSelectMatch={onSelectMatch}
                  onInputChange={handleInputChange}
                  onSave={handleSave}
                  getPointsBadgeColor={getPointsBadgeColor}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
