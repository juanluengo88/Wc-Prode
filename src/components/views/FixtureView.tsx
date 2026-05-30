'use client';

import React, { useState, useEffect } from 'react';
import { Match, Prediction, User } from '../../lib/mockData';
import MotivanationalBanner from '@/lib/MotivationalBanner';

interface FixtureViewProps {
  user: User;
  matches: Match[];
  predictions: Prediction[];
  onSavePrediction: (matchId: string, predictHome: number, predictAway: number) => Promise<void>;
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
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'LIVE' | 'FINISHED'>('ALL');
  const [localScores, setLocalScores] = useState<{ [matchId: string]: { home: string; away: string } }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Keep time updated for dynamic lock checks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Pre-populate input fields with existing predictions
  useEffect(() => {
    const initialScores: typeof localScores = {};
    predictions.forEach((p) => {
      initialScores[p.matchId] = {
        home: p.predictHome.toString(),
        away: p.predictAway.toString(),
      };
    });
    setLocalScores(initialScores);
  }, [predictions]);

  // Utility to determine lock status
  const isMatchLocked = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    const lockLimit = 15 * 60 * 1000; // 15 minutes in ms
    return matchTime - currentTime <= lockLimit;
  };

  const handleInputChange = (matchId: string, team: 'home' | 'away', value: string) => {
    // Only allow positive integers
    if (value !== '' && !/^\d+$/.test(value)) return;
    
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
    if (!scores || scores.home === '' || scores.away === '') return;

    setSavingId(matchId);
    
    try {
      await onSavePrediction(matchId, parseInt(scores.home), parseInt(scores.away));
      setSavingId(null);
      setSuccessId(matchId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch {
      setSavingId(null);
    }
  };

  // Filter matches based on selection
  const filteredMatches = matches.filter((match) => {
    if (filter === 'PENDING') return match.status === 'SCHEDULED';
    if (filter === 'LIVE') return match.status === 'LIVE';
    if (filter === 'FINISHED') return match.status === 'FINISHED';
    return true;
  });

  const getPointsBadgeColor = (points: number | null) => {
    if (points === 3) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (points === 1) return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
    if (points === 0) return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    return '';
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-8 space-y-8">
        
        <MotivanationalBanner></MotivanationalBanner>

        {/* Filter Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'PENDING', 'LIVE', 'FINISHED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  filter === tab
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' && 'Todos'}
                {tab === 'PENDING' && 'Pendientes'}
                {tab === 'LIVE' && 'En Vivo'}
                {tab === 'FINISHED' && 'Finalizados'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Mostrando <strong className="text-slate-200">{filteredMatches.length}</strong> partidos
          </span>
        </div>

        {/* Fixture Grid */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-600 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="text-slate-400 font-medium">No hay partidos en esta categoría en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match) => {
              const pred = predictions.find((p) => p.matchId === match.matchId);
              const locked = isMatchLocked(match.dateTime) || match.status !== 'SCHEDULED';
              
              const homeVal = localScores[match.matchId]?.home ?? '';
              const awayVal = localScores[match.matchId]?.away ?? '';
              const isFormComplete = homeVal !== '' && awayVal !== '';

              // Format date in Spanish
              const dateObj = new Date(match.dateTime);
              const formattedDate = dateObj.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              }).replace('.', '');
              const formattedTime = dateObj.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={match.matchId}
                  onClick={() => onSelectMatch(match.matchId)}
                  className="group relative flex flex-col justify-between backdrop-blur-md bg-slate-900/50 hover:bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                >
                  
                  {/* Card Header (Stage and Status) */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-amber-500/85 tracking-wide uppercase">
                      {match.groupOrStage}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {match.status === 'LIVE' && (
                        <span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/35">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          En Vivo
                        </span>
                      )}
                      {match.status === 'FINISHED' && (
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-700/50">
                          Finalizado
                        </span>
                      )}
                      {match.status === 'SCHEDULED' && (
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

                  {/* Teams and Prediction Section */}
                  <div className="flex items-center justify-between gap-4 py-2">
                    
                    {/* Team Home */}
                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                      <img
                        src={match.teamHomeFlag}
                        alt={match.teamHome}
                        className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
                        onError={(e) => {
                          // Fallback to stylized box if image fails
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none">
                        {match.teamHome}
                      </span>
                    </div>

                    {/* Numeric Prediction Inputs or Actual Scores */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                        /* REAL SCORES (For finished or live) */
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                            {match.scoreHome}
                          </span>
                          <span className="text-slate-500 font-bold text-sm">:</span>
                          <span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                            {match.scoreAway}
                          </span>
                        </div>
                      ) : (
                        /* EDITABLE/LOCKED PREDICTIONS (For Scheduled) */
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            maxLength={2}
                            value={homeVal}
                            disabled={locked}
                            placeholder="-"
                            onChange={(e) => handleInputChange(match.matchId, 'home', e.target.value)}
                            className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-950/70"
                          />
                          <span className="text-slate-600 font-bold">-</span>
                          <input
                            type="text"
                            maxLength={2}
                            value={awayVal}
                            disabled={locked}
                            placeholder="-"
                            onChange={(e) => handleInputChange(match.matchId, 'away', e.target.value)}
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
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none">
                        {match.teamAway}
                      </span>
                    </div>

                  </div>

                  {/* Card Footer (Time & Points / Save Button) */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    
                    {/* Date / Time */}
                    <span className="font-semibold text-slate-500">
                      {formattedDate} - {formattedTime} hs
                    </span>

                    {/* Prediction points earned or save actions */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {match.status === 'FINISHED' ? (
                        pred && pred.pointsEarned !== null ? (
                          <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${getPointsBadgeColor(pred.pointsEarned)}`}>
                            {pred.pointsEarned === 3 && 'Exacto +3 pts'}
                            {pred.pointsEarned === 1 && 'Ganador +1 pt'}
                            {pred.pointsEarned === 0 && '0 pts'}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">Sin pronóstico</span>
                        )
                      ) : match.status === 'LIVE' ? (
                        pred ? (
                          <span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                            Pronóstico: {pred.predictHome}-{pred.predictAway}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-400">Sin pronóstico</span>
                        )
                      ) : (
                        /* Scheduled match action */
                        !locked ? (
                          <button
                            type="button"
                            onClick={(e) => handleSave(e, match.matchId)}
                            disabled={!isFormComplete || savingId === match.matchId}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              successId === match.matchId
                                ? 'bg-emerald-500 text-slate-950'
                                : isFormComplete
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.03]'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
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
                            ) : pred ? (
                              'Actualizar'
                            ) : (
                              'Guardar'
                            )}
                          </button>
                        ) : (
                          pred ? (
                            <span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
                              Pronóstico: {pred.predictHome}-{pred.predictAway}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Cerrado sin apuesta</span>
                          )
                        )
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
