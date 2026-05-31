"use client";

import React from "react";
import { Match, Prediction, User } from "../../lib/mockData";
import MotivanationalBanner from "@/lib/MotivationalBanner";
import MatchCard from "@/lib/MatchCard";
import FixtureNavBar from "@/lib/FixtureNavBar";
import { useFixtureView } from "@/hooks/useFixtureView";

interface FixtureViewProps {
  user: User;
  matches: Match[];
  predictions: Prediction[];
  onSelectMatch: (matchId: string) => void;
  onLogout: () => void;
}

export default function FixtureView({
  matches,
  predictions,
  onSelectMatch,
}: FixtureViewProps) {
  const {
    filteredMatches,
    setFilteredMatches,
    isMatchLocked,
    getPrediction,
    getPointsBadgeColor,
  } = useFixtureView({ matches, predictions });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-8 space-y-8">
        <MotivanationalBanner />

        <FixtureNavBar
          matches={matches}
          onFilteredMatchesChange={setFilteredMatches}
        />

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
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.matchId}
                match={match}
                pred={getPrediction(match.matchId)}
                locked={isMatchLocked(match.dateTime) || match.status !== "SCHEDULED"}
                onSelectMatch={onSelectMatch}
                getPointsBadgeColor={getPointsBadgeColor}
                readonly={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}