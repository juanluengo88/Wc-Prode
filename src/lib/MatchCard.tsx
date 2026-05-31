"use client";
import React from "react";
import { Match, Prediction } from "@/lib/mockData";

interface MatchCardProps {
  match: Match;
  pred?: Prediction;
  locked?: boolean;
  homeVal?: string;
  awayVal?: string;
  savingId?: string | null;
  successId?: string | null;
  isFormComplete?: boolean;
  readonly?: boolean;
  onSelectMatch: (matchId: string) => void;
  onInputChange?: (matchId: string, team: "home" | "away", value: string) => void;
  onSave?: (e: React.MouseEvent, matchId: string) => void;
  getPointsBadgeColor?: (points: number) => string;
}

export default function MatchCard({
  match,
  pred,
  locked = false,
  homeVal = "",
  awayVal = "",
  savingId = null,
  successId = null,
  isFormComplete = false,
  readonly = false,
  onSelectMatch,
  onInputChange,
  onSave,
  getPointsBadgeColor,
}: MatchCardProps) {
  const dateObj = new Date(match.dateTime);
  const formattedDate = dateObj
    .toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    .replace(".", "");
  const formattedTime = dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      onClick={() => onSelectMatch(match.matchId)}
      className="group relative flex flex-col justify-between backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01]"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-amber-500/85 tracking-wide uppercase">
          {match.groupOrStage}
        </span>
        <div className="flex items-center gap-1.5">
          {match.status === "LIVE" && (
            <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/35">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              En Vivo
            </span>
          )}
          {match.status === "FINISHED" && (
            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-700/50">
              Finalizado
            </span>
          )}
          {match.status === "SCHEDULED" && (
            locked ? (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                Cerrado
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M14.5 9h-4.75V5.5a3.25 3.25 0 1 0-6.5 0v3.75A2.25 2.25 0 0 0 1 11.5v6A2.25 2.25 0 0 0 3.25 19.75h11.5A2.25 2.25 0 0 0 17 17.5v-6A2.25 2.25 0 0 0 14.5 9Zm-8-3.5a1.75 1.75 0 0 1 3.5 0V9h-3.5V5.5Z" clipRule="evenodd" />
                </svg>
                Abierto
              </span>
            )
          )}
        </div>
      </div>

      {/* Teams and Scores */}
      <div className="flex items-center justify-between gap-4 py-2">
        {/* Team Home */}
        <div className="flex-1 flex flex-col items-center text-center gap-2">
          <img
            src={match.teamHomeFlag}
            alt={match.teamHome}
            className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
          />
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none">
            {match.teamHome}
          </span>
        </div>

        {/* Score / Inputs */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {match.status === "FINISHED" || match.status === "LIVE" ? (
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                {match.scoreHome ?? "-"}
              </span>
              <span className="text-slate-500 font-bold text-sm">:</span>
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                {match.scoreAway ?? "-"}
              </span>
            </div>
          ) : readonly ? (
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
                -
              </span>
              <span className="text-slate-500 font-bold text-sm">:</span>
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
                -
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                maxLength={2}
                value={homeVal}
                disabled={locked}
                placeholder="-"
                onChange={(e) => onInputChange?.(match.matchId, "home", e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-950/70"
              />
              <span className="text-slate-600 font-bold">-</span>
              <input
                type="text"
                maxLength={2}
                value={awayVal}
                disabled={locked}
                placeholder="-"
                onChange={(e) => onInputChange?.(match.matchId, "away", e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-950/70"
              />
            </div>
          )}
        </div>

        {/* Team Away */}
        <div className="flex-1 flex flex-col items-center text-center gap-2">
          <img
            src={match.teamAwayFlag}
            alt={match.teamAway}
            className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
          />
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none">
            {match.teamAway}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-500">
          {formattedDate} - {formattedTime} hs
        </span>

        {readonly ? (
          <>
            {match.status === "LIVE" && (
              <span className="text-[10px] text-red-400 font-semibold uppercase animate-pulse">
                En curso
              </span>
            )}
            {match.status === "FINISHED" && (
              <span className="text-[10px] text-slate-500 font-semibold uppercase">
                Finalizado
              </span>
            )}
            {match.status === "SCHEDULED" && (
              <span className="text-[10px] text-slate-500 font-semibold uppercase">
                Sin iniciar
              </span>
            )}
          </>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            {match.status === "FINISHED" ? (
              pred && pred.pointsEarned !== null ? (
                <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${getPointsBadgeColor?.(pred.pointsEarned)}`}>
                  {pred.pointsEarned === 3 && "Exacto +3 pts"}
                  {pred.pointsEarned === 1 && "Ganador +1 pt"}
                  {pred.pointsEarned === 0 && "0 pts"}
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Sin pronóstico</span>
              )
            ) : match.status === "LIVE" ? (
              pred ? (
                <span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                  Pronóstico: {pred.predictHome}-{pred.predictAway}
                </span>
              ) : (
                <span className="text-[10px] text-red-400">Sin pronóstico</span>
              )
            ) : !locked ? (
              <button
                type="button"
                onClick={(e) => onSave?.(e, match.matchId)}
                disabled={!isFormComplete || savingId === match.matchId}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  successId === match.matchId
                    ? "bg-emerald-500 text-slate-950"
                    : isFormComplete
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.03]"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                }`}
              >
                {savingId === match.matchId ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : successId === match.matchId ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                ) : pred ? "Actualizar" : "Guardar"}
              </button>
            ) : pred ? (
              <span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                Pronóstico: {pred.predictHome}-{pred.predictAway}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cerrado sin apuesta</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}