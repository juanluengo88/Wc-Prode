"use client";

import React, { useState } from "react";
import { Match, Prediction, User } from "../../lib/mockData";
import MotivanationalBanner from "../banners/MotivationalBanner";
import MatchCard from "@/components/cards/MatchCard";
import FixtureNavBar from "@/components/navigation/FixtureNavBar";
import { useFixtureView } from "@/hooks/useFixtureView";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface FixtureViewProps {
  user: User;
  matches: Match[];
  predictions: Prediction[];
  onSelectMatch: (matchId: string, fromUrl?: string) => void;
  onLogout: () => void;
}

export default function FixtureView({
  matches,
  predictions,
  onSelectMatch,
}: FixtureViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const { isMatchLocked, getPrediction, getPointsBadgeColor, teamsAreDefined } = useFixtureView({ matches, predictions });

  const tab = searchParams.get("tab") || "todos";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const selectedGroup = searchParams.get("group") || "ALL";
  const selectedStage = searchParams.get("stage") || "ALL";
  const [search, setSearch] = useState("");
  const matchesPerPage = 20;

  const filteredMatches = React.useMemo(() => {
    const statusMap: Record<string, string> = { pendientes: "SCHEDULED", live: "LIVE", finalizados: "FINISHED" };
    const statusFilter = statusMap[tab] ?? null;
    return matches.filter((m) => {
      const statusOk = statusFilter === null || m.status === statusFilter;
      const groupOk = selectedGroup === "ALL" || m.groupOrStage === selectedGroup;
      const stageOk = selectedStage === "ALL" || m.groupOrStage === selectedStage;
      const searchOk = search.trim() === "" || m.teamHome?.toLowerCase().includes(search.toLowerCase()) || m.teamAway?.toLowerCase().includes(search.toLowerCase());
      return statusOk && groupOk && stageOk && searchOk;
    });
  }, [matches, tab, search, selectedGroup, selectedStage]);

  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber === 1) params.delete("page");
    else params.set("page", String(pageNumber));
    const qs = params.toString();
    router.push(qs ? `/fixture?${qs}` : "/fixture", { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-8 space-y-8">
        <MotivanationalBanner />

        <FixtureNavBar
          matches={matches}
          search={search}
          selectedGroup={selectedGroup}
          selectedStage={selectedStage}
          onSearchChange={setSearch}
          filteredCount={filteredMatches.length}
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
            <p className="text-slate-400 font-medium">{t("fixture_empty")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentMatches.map((match) => {
                const tbdTeams = !teamsAreDefined(match);
                return (
                  <MatchCard
                    key={match.matchId}
                    match={match}
                    pred={getPrediction(match.matchId)}
                    locked={
                      tbdTeams ||
                      isMatchLocked(match.dateTime) ||
                      match.status !== "SCHEDULED"
                    }
                    tbdTeams={tbdTeams}
                    onSelectMatch={(matchId) => onSelectMatch(matchId, window.location.pathname + window.location.search)}
                    getPointsBadgeColor={getPointsBadgeColor}
                    readonly={true}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs text-slate-400">
                <span>
                  {t("fixture_showing", {
                    start: indexOfFirstMatch + 1,
                    end: indexOfLastMatch > filteredMatches.length ? filteredMatches.length : indexOfLastMatch,
                    total: filteredMatches.length,
                  })}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-bold text-slate-200"
                  >
                    {t("fixture_prev")}
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-8 h-8 rounded-xl font-bold border transition-all ${
                          currentPage === pageNumber
                            ? "bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-bold text-slate-200"
                  >
                    {t("fixture_next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
