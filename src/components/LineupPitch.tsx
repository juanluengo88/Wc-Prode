"use client";

import React from "react";

interface LineupPitchProps {
  formacionHome: string;
  formacionAway: string;
  titularesHome: string[];
  titularesAway: string[];
  teamHome: string;
  teamAway: string;
}

function abbrev(name: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last.length > 8 ? last.slice(0, 8) : last;
}

function evenlySpaced(n: number, W: number, PAD: number): number[] {
  if (n === 1) return [W / 2];
  const step = (W - PAD * 2) / (n - 1);
  return Array.from({ length: n }, (_, i) => PAD + step * i);
}

type PlayerPos = { x: number; y: number; name: string };

function buildPositions(
  formation: number[],
  players: string[],
  isHome: boolean,
  W: number,
  H: number,
): PlayerPos[] {
  const PAD_X = 42;
  const nRows = formation.length;
  const gkY = isHome ? H - 38 : 38;
  const rowNear = isHome ? H - 82 : 82;
  const rowFar = isHome ? H / 2 + 22 : H / 2 - 22;

  const positions: PlayerPos[] = [
    { x: W / 2, y: gkY, name: abbrev(players[0]) },
  ];

  let idx = 1;
  formation.forEach((count, rowIdx) => {
    const t = nRows === 1 ? 0.5 : rowIdx / (nRows - 1);
    const y = rowNear + t * (rowFar - rowNear);
    evenlySpaced(count, W, PAD_X).forEach((x) => {
      positions.push({ x, y, name: abbrev(players[idx] ?? "") });
      idx++;
    });
  });

  return positions;
}

export default function LineupPitch({
  formacionHome,
  formacionAway,
  titularesHome,
  titularesAway,
  teamHome,
  teamAway,
}: LineupPitchProps) {
  const W = 340;
  const H = 600;

  const homeForm = formacionHome.split("-").map(Number);
  const awayForm = formacionAway.split("-").map(Number);

  const homePlayers = buildPositions(homeForm, titularesHome, true, W, H);
  const awayPlayers = buildPositions(awayForm, titularesAway, false, W, H);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
      {/* Formation header */}
      <div className="flex items-stretch border-b border-slate-800/60">
        <div className="flex-1 flex flex-col items-center py-3 px-4 bg-indigo-950/40">
          <span className="text-[9px] font-black text-indigo-400/70 uppercase tracking-widest w-full text-center truncate">
            {teamHome}
          </span>
          <span className="text-xl font-black text-indigo-300 leading-tight">
            {formacionHome}
          </span>
        </div>
        <div className="flex items-center px-3 border-x border-slate-800/60">
          <span className="text-[9px] font-bold text-slate-600 uppercase">vs</span>
        </div>
        <div className="flex-1 flex flex-col items-center py-3 px-4 bg-amber-950/20">
          <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest w-full text-center truncate">
            {teamAway}
          </span>
          <span className="text-xl font-black text-amber-300 leading-tight">
            {formacionAway}
          </span>
        </div>
      </div>

      {/* Pitch SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="lp-grass"
            x="0"
            y="0"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <rect width="34" height="17" fill="#163025" />
            <rect y="17" width="34" height="17" fill="#1a3929" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#lp-grass)" />

        {/* Pitch outline */}
        <rect
          x="14"
          y="14"
          width={W - 28}
          height={H - 28}
          fill="none"
          stroke="#235438"
          strokeWidth="1.5"
        />

        {/* Center line */}
        <line
          x1="14"
          y1={H / 2}
          x2={W - 14}
          y2={H / 2}
          stroke="#235438"
          strokeWidth="1.5"
        />

        {/* Center circle */}
        <circle
          cx={W / 2}
          cy={H / 2}
          r="40"
          fill="none"
          stroke="#235438"
          strokeWidth="1.5"
        />
        <circle cx={W / 2} cy={H / 2} r="3" fill="#235438" />

        {/* Home penalty area */}
        <rect
          x="82"
          y={H - 101}
          width="176"
          height="87"
          fill="none"
          stroke="#235438"
          strokeWidth="1.2"
        />
        {/* Home goal box */}
        <rect
          x="120"
          y={H - 43}
          width="100"
          height="29"
          fill="none"
          stroke="#235438"
          strokeWidth="1.2"
        />
        {/* Home penalty spot */}
        <circle cx={W / 2} cy={H - 118} r="2" fill="#235438" />

        {/* Away penalty area */}
        <rect
          x="82"
          y="14"
          width="176"
          height="87"
          fill="none"
          stroke="#235438"
          strokeWidth="1.2"
        />
        {/* Away goal box */}
        <rect
          x="120"
          y="14"
          width="100"
          height="29"
          fill="none"
          stroke="#235438"
          strokeWidth="1.2"
        />
        {/* Away penalty spot */}
        <circle cx={W / 2} cy="118" r="2" fill="#235438" />

        {/* Away players – amber */}
        {awayPlayers.map((p, i) => (
          <g key={`a${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="12"
              fill="#78350f"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y + 22}
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#fde68a"
              fontFamily="system-ui,sans-serif"
              letterSpacing="-0.3"
            >
              {p.name}
            </text>
          </g>
        ))}

        {/* Home players – indigo */}
        {homePlayers.map((p, i) => (
          <g key={`h${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r="12"
              fill="#312e81"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y + 22}
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#c7d2fe"
              fontFamily="system-ui,sans-serif"
              letterSpacing="-0.3"
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
