'use client';

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '../../lib/mockData';

interface MyPredictionsViewProps {
  matches: Match[];
  predictions: Prediction[];
  onSelectMatch: (matchId: string) => void;
}

export default function MyPredictionsView({
  matches,
  predictions,
  onSelectMatch,
}: MyPredictionsViewProps) {
  const [subTab, setSubTab] = useState<'ACTIVE' | 'FINISHED'>('ACTIVE');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Keep countdown times accurate with 1-second interval ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Map user's predictions with their corresponding matches
  const predictionList = predictions.map((pred) => {
    const match = matches.find((m) => m.matchId === pred.matchId);
    return {
      prediction: pred,
      match: match,
    };
  }).filter((item) => item.match !== undefined) as { prediction: Prediction; match: Match }[];

  // Filter into active and finished
  const activePredictions = predictionList.filter(
    (item) => item.match.status === 'SCHEDULED' || item.match.status === 'LIVE'
  );
  
  const finishedPredictions = predictionList.filter(
    (item) => item.match.status === 'FINISHED'
  );

  // Helper to format remaining time
  const getRemainingTimeStr = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    const diff = matchTime - currentTime;
    const lockLimit = 15 * 60 * 1000; // 15 mins

    if (diff <= lockLimit) {
      return 'CERRADO (FALTAN < 15 MIN)';
    }

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return `Cierra en: ${parts.join(' ')}`;
  };

  const isLocked = (matchDateTimeStr: string) => {
    const matchTime = new Date(matchDateTimeStr).getTime();
    return matchTime - currentTime <= 15 * 60 * 1000;
  };

  const getPointsTagColor = (points: number | null) => {
    if (points === 3) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    if (points === 1) return 'bg-sky-500/10 text-sky-400 border border-sky-500/25';
    return 'bg-slate-900 text-slate-500 border border-slate-850';
  };

  const activeTabList = subTab === 'ACTIVE' ? activePredictions : finishedPredictions;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-16">
      
      {/* Sub Header Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-880 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-white">Mis Pronósticos</h2>
            <p className="text-xs text-slate-400">Historial y seguimiento de tus apuestas</p>
          </div>

          {/* Sub tabs switcher */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
            <button
              onClick={() => setSubTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'ACTIVE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              Activos ({activePredictions.length})
            </button>
            <button
              onClick={() => setSubTab('FINISHED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'FINISHED'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-455 hover:text-slate-200'
              }`}
            >
              Finalizados ({finishedPredictions.length})
            </button>
          </div>
        </div>
      </header>

      {/* View List Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-8">
        
        {activeTabList.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-650 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <p className="text-slate-500 text-sm font-medium">
              No tienes pronósticos {subTab === 'ACTIVE' ? 'activos' : 'finalizados'} en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTabList.map(({ prediction, match }) => {
              const locked = isLocked(match.dateTime) || match.status !== 'SCHEDULED';
              
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
                  key={prediction.predictionId}
                  onClick={() => onSelectMatch(match.matchId)}
                  className="group relative flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-880 hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-md"
                >
                  
                  {/* Left: Match metadata */}
                  <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {match.groupOrStage}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {formattedDate} - {formattedTime} hs
                    </span>
                  </div>

                  {/* Center: Match Matchup Teams */}
                  <div className="flex items-center justify-center gap-4 flex-1">
                    
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 w-28 justify-end text-right">
                      <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-none text-slate-200">
                        {match.teamHome}
                      </span>
                      <img src={match.teamHomeFlag} alt={match.teamHome} className="w-8 h-5 object-cover rounded shadow" />
                    </div>

                    {/* Score comparison visual */}
                    <div className="flex flex-col items-center justify-center bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850">
                      <div className="flex items-center gap-1.5">
                        {/* User prediction */}
                        <span className="text-sm font-black text-amber-400">{prediction.predictHome}</span>
                        <span className="text-slate-655 font-bold text-xs">-</span>
                        <span className="text-sm font-black text-amber-400">{prediction.predictAway}</span>
                      </div>
                      
                      {/* Real result indicator below user prediction */}
                      {match.status === 'FINISHED' || match.status === 'LIVE' ? (
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1 pt-0.5 border-t border-slate-850/60">
                          Real: {match.scoreHome}-{match.scoreAway}
                        </div>
                      ) : null}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 w-28 justify-start text-left">
                      <img src={match.teamAwayFlag} alt={match.teamAway} className="w-8 h-5 object-cover rounded shadow" />
                      <span className="text-xs font-bold truncate max-w-[80px] sm:max-w-none text-slate-200">
                        {match.teamAway}
                      </span>
                    </div>

                  </div>

                  {/* Right: Dynamic locking timer or points award tag */}
                  <div className="shrink-0 w-full sm:w-auto flex items-center justify-center sm:justify-end">
                    {match.status === 'FINISHED' ? (
                      <div className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getPointsTagColor(prediction.pointsEarned)}`}>
                        {prediction.pointsEarned === 3 && 'Exacto +3 pts'}
                        {prediction.pointsEarned === 1 && 'Ganador +1 pt'}
                        {prediction.pointsEarned === 0 && '0 pts'}
                      </div>
                    ) : match.status === 'LIVE' ? (
                      <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        En Vivo
                      </span>
                    ) : (
                      /* Scheduled match locking countdown */
                      <div className="text-center sm:text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          locked
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/15'
                            : 'bg-slate-850 text-slate-400 border-slate-800'
                        }`}>
                          {getRemainingTimeStr(match.dateTime)}
                        </span>
                      </div>
                    )}
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
