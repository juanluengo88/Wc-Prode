"use client";
import React from "react";
import { Match, Prediction } from "@/lib/mockData";
import { useMatchDetails } from "@/hooks/useMatchDetails";

interface MatchCardProps {
  match: Match;
  pred?: Prediction;
  locked?: boolean;
  tbdTeams?: boolean;
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
  tbdTeams = false,
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

  // ACTIVAMOS NUESTRO HOOK EN SEGUNDO PLANO ⚡
  // Usamos el ID de ESPN asociado a tu partido (por ejemplo: match.idESPN o match.matchId si usas el mismo)
  const { data: espn, loading } = useMatchDetails(match.espnMatchId || match.matchId);

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
          {match.status === "SCHEDULED" && tbdTeams && (
            <span className="flex items-center gap-1 bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-600/40">
              Por definir
            </span>
          )}
          {match.status === "SCHEDULED" && !tbdTeams && (
            locked ? (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                Cerrado
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
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
          {tbdTeams ? (
            <div className="w-12 h-8 rounded-md bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
              <span className="text-[10px] text-slate-600 font-bold">?</span>
            </div>
          ) : (
            <img
              src={match.teamHomeFlag}
              alt={match.teamHome}
              className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
          )}
          <span className={`text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none ${tbdTeams ? "text-slate-500 italic" : ""}`}>
            {tbdTeams ? "Por definir" : match.teamHome}
          </span>
        </div>

        {/* Score / Inputs */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {tbdTeams ? (
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide text-center leading-tight px-1">
              Equipos<br />pendientes
            </span>
          ) : match.status === "FINISHED" || match.status === "LIVE" ? (
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
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">-</span>
              <span className="text-slate-500 font-bold text-sm">:</span>
              <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">-</span>
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
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <span className="text-slate-600 font-bold">-</span>
              <input
                type="text"
                maxLength={2}
                value={awayVal}
                disabled={locked}
                placeholder="-"
                onChange={(e) => onInputChange?.(match.matchId, "away", e.target.value)}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>

        {/* Team Away */}
        <div className="flex-1 flex flex-col items-center text-center gap-2">
          {tbdTeams ? (
            <div className="w-12 h-8 rounded-md bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
              <span className="text-[10px] text-slate-600 font-bold">?</span>
            </div>
          ) : (
            <img
              src={match.teamAwayFlag}
              alt={match.teamAway}
              className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
          )}
          <span className={`text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none ${tbdTeams ? "text-slate-500 italic" : ""}`}>
            {tbdTeams ? "Por definir" : match.teamAway}
          </span>
        </div>
      </div>

      {/* 📊 DINÁMICO CAPA 1: SI EL PARTIDO ES PREVIA (SCHEDULED) -> MOSTRAR ODDS Y TABLAS */}
      {match.status === "SCHEDULED" && espn?.probabilidadesPrediccion?.tieneOdds && (
        <div className="mt-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/70" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium px-0.5">
            <span>Prob. {match.teamHome}</span>
            <span>Empate</span>
            <span>Prob. {match.teamAway}</span>
          </div>
          <div className="w-full flex h-3 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
            <div style={{ width: `${espn.probabilidadesPrediccion.local}%` }} className="bg-emerald-500/80 transition-all duration-500" title={`Gana Local: ${espn.probabilidadesPrediccion.local}%`} />
            <div style={{ width: `${espn.probabilidadesPrediccion.empate}%` }} className="bg-slate-500/70 transition-all duration-500" title={`Empate: ${espn.probabilidadesPrediccion.empate}%`} />
            <div style={{ width: `${espn.probabilidadesPrediccion.visitante}%` }} className="bg-red-500/80 transition-all duration-500" title={`Gana Visitante: ${espn.probabilidadesPrediccion.visitante}%`} />
          </div>
          <div className="flex justify-between text-[11px] font-bold mt-1 px-1">
            <span className="text-emerald-400">{espn.probabilidadesPrediccion.local}%</span>
            <span className="text-slate-400">{espn.probabilidadesPrediccion.empate}%</span>
            <span className="text-red-400">{espn.probabilidadesPrediccion.visitante}%</span>
          </div>

          {/* Historial Corto H2H Oculto Expandible */}
          {Array.isArray(espn.previaEstadisticas?.historialH2H) && espn.previaEstadisticas.historialH2H.length > 0 && (
            <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-800/50 pt-1.5 text-center italic">
              Último cruce: {espn.previaEstadisticas.historialH2H[0].partido || "Sin registros recientes"}
            </div>
          )}
        </div>
      )}

      {/* ⚽ DINÁMICO CAPA 2: SI EL PARTIDO EMPEZÓ O TERMINÓ (LIVE / FINISHED) -> MOSTRAR FORMACIONES Y EVENTOS */}
      {(match.status === "LIVE" || match.status === "FINISHED") && espn && (
        <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Fila de Formaciones */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded border border-slate-800/40">
            <span>Esquema: <b className="text-amber-500/90">{espn.detallesTacticos?.formacionHome || "N/A"}</b></span>
            <span className="text-slate-600">VS</span>
            <span>Esquema: <b className="text-amber-500/90">{espn.detallesTacticos?.formacionAway || "N/A"}</b></span>
          </div>

          {/* Última Incidencia en Vivo */}
          {espn.eventosEnVivo && espn.eventosEnVivo.length > 0 && (
            <div className="text-[11px] bg-slate-900/30 p-2 rounded border border-slate-800/30 flex items-start gap-2 max-h-16 overflow-y-auto">
              <span className={`px-1 py-0.5 rounded font-black text-[9px] uppercase leading-none mt-0.5 ${
                espn.eventosEnVivo[espn.eventosEnVivo.length - 1].tipo === "gol" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce" : "bg-slate-800 text-slate-400"
              }`}>
                {espn.eventosEnVivo[espn.eventosEnVivo.length - 1].tiempo}
              </span>
              <p className="text-slate-400 leading-snug flex-1 truncate">
                {espn.eventosEnVivo[espn.eventosEnVivo.length - 1].descripcion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-500">
          {formattedDate} - {formattedTime} hs
        </span>

        {readonly ? (
          <>
            {match.status === "LIVE" && <span className="text-[10px] text-red-400 font-semibold uppercase animate-pulse">En curso</span>}
            {match.status === "FINISHED" && <span className="text-[10px] text-slate-500 font-semibold uppercase">Finalizado</span>}
            {match.status === "SCHEDULED" && tbdTeams && <span className="text-[10px] text-slate-500 italic font-semibold">Equipos por confirmar</span>}
            {match.status === "SCHEDULED" && !tbdTeams && <span className="text-[10px] text-slate-500 font-semibold uppercase">Sin iniciar</span>}
          </>
        ) : (
          <div onClick={(e) => e.stopPropagation()}>
            {tbdTeams ? (
              <span className="text-[10px] text-slate-500 italic font-semibold">Equipos por confirmar</span>
            ) : match.status === "FINISHED" ? (
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