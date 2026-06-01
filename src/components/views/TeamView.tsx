'use client'; 

import { useEffect, useState } from "react";
import fetchTeam from "../../hooks/useTeamView";

interface Player {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

interface TeamData {
  id: string;
  name: string;
  coach: string;
  squad: Player[];
}

interface TeamViewProps {
  teamId: string;
}

export default function TeamView({ teamId }: TeamViewProps) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const getTeamData = async () => {
      try {
        setLoading(true);
        const data = await fetchTeam(teamId);
        if (data?.error) {
          setError(data.error);
        } else {
          setTeam(data);
        }
      } catch (err) {
        setError("Error al cargar el equipo");
      } finally {
        setLoading(false);
      }
    };

    getTeamData();
  }, [teamId]);

  // Pantallas de Estado de Carga / Error
  if (loading) {
    return (
      <div className="flex-1 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium text-sm">Cargando plantel del equipo...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex-1 bg-slate-950 min-h-screen flex items-center justify-center p-4">
        <div className="text-center py-16 px-6 bg-slate-900/30 rounded-3xl border border-slate-900 max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <span className="text-red-400 font-bold text-xl">!</span>
          </div>
          <p className="text-slate-200 font-semibold mb-1">Hubo un inconveniente</p>
          <p className="text-slate-400 text-sm">{error || "No se encontraron datos de este equipo."}</p>
        </div>
      </div>
    );
  }

  // Orden visual de los bloques en la pantalla
  const positionsOrder = ["Goalkeeper", "Defence", "Midfield", "Offence", "Otros"];
  
  // Agrupador inteligente e inclusivo por palabras clave en minúsculas
  const groupedSquad = team.squad?.reduce((acc, player) => {
    const rawPosition = (player.position || "").toLowerCase();
    let targetPosition = "Otros"; 

    if (rawPosition.includes("goalkeeper") || rawPosition.includes("keeper")) {
      targetPosition = "Goalkeeper";
    } 
    else if (rawPosition.includes("defence") || rawPosition.includes("back") || rawPosition.includes("defender")) {
      targetPosition = "Defence";
    } 
    else if (rawPosition.includes("midfield")) {
      targetPosition = "Midfield";
    } 
    else if (
      rawPosition.includes("offence") || 
      rawPosition.includes("forward") || 
      rawPosition.includes("striker") || 
      rawPosition.includes("winger") || 
      rawPosition.includes("attacker")
    ) {
      targetPosition = "Offence";
    } 
    else {
      targetPosition = "Otros";
    }

    if (!acc[targetPosition]) acc[targetPosition] = [];
    acc[targetPosition].push(player);
    return acc;
  }, {} as Record<string, Player[]>) || {};

  // Traductor de encabezados para la interfaz
  const translatePosition = (pos: string) => {
    switch(pos) {
      case "Goalkeeper": return "Arqueros";
      case "Defence": return "Defensores";
      case "Midfield": return "Mediocampistas";
      case "Offence": return "Delanteros";
      default: return "Otros puestos";
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-8 space-y-8">
        
        {/* Encabezado de la Selección */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-900/60 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              Selección Nacional
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {team.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <p>
                DT: <span className="text-slate-200 font-medium">{team.coach || "No especificado"}</span>
              </p>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <p className="hidden sm:block">
                ID Torneo: <span className="font-mono text-xs text-amber-500">{team.id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Listado del Plantel */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600"></span>
            Lista de Convocados
          </h2>

          <div className="space-y-8">
            {positionsOrder.map((positionKey) => {
              const players = groupedSquad[positionKey];
              if (!players || players.length === 0) return null;

              return (
                <div key={positionKey} className="space-y-3">
                  {/* Divisor de Línea / Puesto */}
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase border-b border-slate-900 pb-2">
                    {translatePosition(positionKey)} ({players.length})
                  </h3>

                  {/* Grilla de Jugadores de esta posición */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {players.map((player) => (
                      <div 
                        key={player.id}
                        className="flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl border border-slate-900/80 hover:border-slate-800 transition-all group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {player.name}
                          </p>
                          {/* Muestra la posición exacta de la API (ej: Attacking Midfield o Centre-Forward) */}
                          <p className="text-[11px] text-amber-500/80 font-medium capitalize">
                            {player.position.replace('-', ' ')}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-slate-750 group-hover:text-slate-300 transition-colors">
                            {player.nationality === team.name ? "Nativo" : player.nationality}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {player.dateOfBirth || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}