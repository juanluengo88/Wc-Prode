"use client";

import React, { useState, useEffect } from "react";
import { Match, Prediction, User } from "../../lib/mockData";
import MotivanationalBanner from "../banners/MotivationalBanner";
import MatchCard from "@/components/MatchCard/MatchCard";
import FixtureNavBar from "@/components/navigation/FixtureNavBar";
import { useFixtureView } from "@/hooks/useFixtureView";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 IMPORTAMOS LOS HOOKS DE NAVEGACIÓN

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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    filteredMatches,
    setFilteredMatches,
    isMatchLocked,
    getPrediction,
    getPointsBadgeColor,
    teamsAreDefined
  } = useFixtureView({ matches, predictions });

  // 🕒 LEEMOS LA PÁGINA INICIAL DE LA URL (?page=X). Si no existe, por defecto es 1.
  const queryPage = searchParams.get("page");
  const initialPage = queryPage ? parseInt(queryPage, 10) : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const matchesPerPage = 20;

  // Sincronizar el estado local si la URL cambia externamente (ej: botón atrás del navegador)
  useEffect(() => {
    if (queryPage) {
      setCurrentPage(parseInt(queryPage, 10));
    }
  }, [queryPage]);

  // Si los filtros cambian la cantidad de partidos, reiniciamos la paginación de forma segura en la URL
  useEffect(() => {
    const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      handlePageChange(totalPages);
    }
  }, [filteredMatches.length]);

  // Cálculos de índices matemáticos para rebanar el array
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);
  
  // Total de páginas redondeado hacia arriba
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  // 🚀 FUNCIÓN CAMBIAR PÁGINA: Actualiza el estado y lo inyecta en la URL de Next.js
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    
    // Modificamos la URL sin recargar la página para que quede guardada en el historial
    router.push(`?page=${pageNumber}`, { scroll: false });

    // Scroll suave hacia arriba para que el usuario vea el inicio de la nueva página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <div className="space-y-8">
            {/* Grilla que renderiza únicamente los 20 mapeados de la página actual */}
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
                    onSelectMatch={onSelectMatch}
                    getPointsBadgeColor={getPointsBadgeColor}
                    readonly={true}
                  />
                );
              })}
            </div>

            {/* CONTROLES DE PAGINACIÓN INTERACTIVA DE TU PRODE */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs text-slate-400">
                <span>
                  Mostrando <strong className="text-slate-200">{indexOfFirstMatch + 1}</strong> a{" "}
                  <strong className="text-slate-200">
                    {indexOfLastMatch > filteredMatches.length ? filteredMatches.length : indexOfLastMatch}
                  </strong>{" "}
                  de <strong className="text-slate-200">{filteredMatches.length}</strong> partidos
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Botón Atrás */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-bold text-slate-200"
                  >
                    Anterior
                  </button>

                  {/* Números de Página Interactivos */}
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

                  {/* Botón Siguiente */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-bold text-slate-200"
                  >
                    Siguiente
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