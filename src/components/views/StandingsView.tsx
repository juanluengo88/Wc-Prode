"use client";

import React from "react";
import type { StandingsData, StandingGroup, TeamRow, Scorer } from "@/types/standings";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

type T = (key: TranslationKey, params?: Record<string, string | number>) => string;

interface Props {
	data: StandingsData | null;
	isLoading: boolean;
	error: string | null;
}

export default function StandingsView({ data, isLoading, error }: Props) {
	const { t } = useLanguage();

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
				<div className="w-10 h-10 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
				<p className="text-slate-400 text-sm">{t("standings_loading")}</p>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
				<p className="text-red-400 text-sm">{error ?? t("standings_noData")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
					{t("standings_title")}
				</h1>
				<p className="text-xs text-slate-500 mt-1">
					{t("standings_matchday", { matchday: data.currentMatchday })}
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-5 items-start">
				<div className="flex-1 space-y-4 w-full">
					{data.standings.map((group) => (
						<GroupTable key={group.group} group={group} t={t} />
					))}
				</div>

				<div className="w-full lg:w-64 lg:sticky lg:top-20 shrink-0">
					<TopScorers scorers={data.scorers} t={t} />
				</div>
			</div>
		</div>
	);
}

function GroupTable({ group, t }: { group: StandingGroup; t: T }) {
	const letter = group.group.replace("Group ", "");

	return (
		<div className="backdrop-blur-xl bg-slate-900/75 border border-slate-800 rounded-2xl overflow-hidden">
			<div className="px-4 py-3 border-b border-slate-800">
				<h2 className="text-sm font-bold text-white tracking-wide">
					{t("standings_groupPrefix", { letter })}
				</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-xs min-w-[360px]">
					<thead>
						<tr className="text-slate-500 uppercase tracking-wider text-[10px]">
							<th className="pl-4 pr-2 py-2 text-left w-7">#</th>
							<th className="px-2 py-2 text-left">{t("standings_colTeam")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colPJ")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colW")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colD")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colL")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colGF")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colGA")}</th>
							<th className="px-1.5 py-2 text-center">{t("standings_colGD")}</th>
							<th className="pr-4 pl-1.5 py-2 text-center font-bold text-amber-400/80">
								{t("standings_colPts")}
							</th>
						</tr>
					</thead>
					<tbody>
						{group.table.map((row) => (
							<TeamRowComponent key={row.team.id} row={row} />
						))}
					</tbody>
				</table>
			</div>

			<div className="px-4 py-2 border-t border-slate-800/50 flex items-center gap-1.5">
				<div className="w-1 h-3 rounded-full bg-emerald-500" />
				<span className="text-[10px] text-slate-500">
					{t("standings_qualifyLegend")}
				</span>
			</div>
		</div>
	);
}

function TeamRowComponent({ row }: { row: TeamRow }) {
	const qualifies = row.position <= 2;

	return (
		<tr
			className={`border-t border-slate-800/40 transition-colors hover:bg-slate-800/30 ${
				qualifies ? "bg-emerald-950/20" : ""
			}`}
		>
			<td className="py-2.5 relative">
				{qualifies && (
					<div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-emerald-500 rounded-full" />
				)}
				<span
					className={`pl-4 font-bold ${qualifies ? "text-emerald-400" : "text-slate-500"}`}
				>
					{row.position}
				</span>
			</td>
			<td className="px-2 py-2.5">
				<div className="flex items-center gap-2">
					<img
						src={row.team.crest}
						alt={row.team.shortName}
						className="w-5 h-5 object-contain shrink-0"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
						}}
					/>
					<span className="text-white font-medium truncate max-w-[90px]">
						{row.team.shortName}
					</span>
				</div>
			</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.playedGames}</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.won}</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.draw}</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.lost}</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.goalsFor}</td>
			<td className="px-1.5 py-2.5 text-center text-slate-300">{row.goalsAgainst}</td>
			<td
				className={`px-1.5 py-2.5 text-center font-medium ${
					row.goalDifference > 0
						? "text-emerald-400"
						: row.goalDifference < 0
							? "text-red-400"
							: "text-slate-400"
				}`}
			>
				{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
			</td>
			<td className="pr-4 pl-1.5 py-2.5 text-center font-bold text-white">
				{row.points}
			</td>
		</tr>
	);
}

function TopScorers({ scorers, t }: { scorers: Scorer[]; t: T }) {
	return (
		<div className="backdrop-blur-xl bg-slate-900/75 border border-slate-800 rounded-2xl overflow-hidden">
			<div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					className="w-4 h-4 text-amber-400"
				>
					<path
						fillRule="evenodd"
						d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
						clipRule="evenodd"
					/>
				</svg>
				<h2 className="text-sm font-bold text-white">
					{t("standings_topScorersTitle")}
				</h2>
			</div>

			<div className="divide-y divide-slate-800/50">
				{scorers.map((scorer, idx) => (
					<ScorerRow key={scorer.player.id} scorer={scorer} rank={idx + 1} t={t} />
				))}
			</div>
		</div>
	);
}

function ScorerRow({ scorer, rank, t }: { scorer: Scorer; rank: number; t: T }) {
	const isTop = rank === 1;

	return (
		<div
			className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-800/30 ${
				isTop ? "bg-amber-500/5" : ""
			}`}
		>
			<span
				className={`text-xs font-bold w-4 text-center shrink-0 ${
					isTop ? "text-amber-400" : "text-slate-500"
				}`}
			>
				{rank}
			</span>
			<img
				src={scorer.team.crest}
				alt={scorer.team.shortName}
				className="w-6 h-6 object-contain shrink-0"
				onError={(e) => {
					(e.target as HTMLImageElement).style.display = "none";
				}}
			/>
			<div className="flex-1 min-w-0">
				<p
					className={`text-xs font-semibold truncate ${
						isTop ? "text-white" : "text-slate-300"
					}`}
				>
					{scorer.player.name}
				</p>
				<p className="text-[10px] text-slate-500 truncate">{scorer.team.shortName}</p>
			</div>
			<div className="text-right shrink-0">
				<p className={`text-sm font-bold ${isTop ? "text-amber-400" : "text-white"}`}>
					{scorer.goals}
				</p>
				<p className="text-[10px] text-slate-500">{t("standings_goalsUnit")}</p>
			</div>
		</div>
	);
}
