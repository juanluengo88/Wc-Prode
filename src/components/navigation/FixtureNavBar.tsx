// components/FixtureNavBar.tsx
"use client";

import React, { useState, useMemo, ReactNode } from "react";
import { Match } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

type FilterType = "ALL" | "PENDING" | "LIVE" | "FINISHED";

interface FixtureNavBarProps {
	matches: Match[];
	onFilteredMatchesChange: (filtered: Match[]) => void;
}

function hasTeams(match: Match): boolean {
	return !!(match.teamHome && match.teamAway);
}

function matchesSearch(match: Match, newSearch: string): boolean {
	if (newSearch.trim() === "") return true;
	if (!hasTeams(match)) return false;
	return (
		match.teamHome.toLowerCase().includes(newSearch.toLowerCase()) ||
		match.teamAway.toLowerCase().includes(newSearch.toLowerCase())
	);
}

export default function FixtureNavBar({
	matches,
	onFilteredMatchesChange,
}: FixtureNavBarProps) {
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [search, setSearch] = useState("");
	const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
	const [selectedStage, setSelectedStage] = useState<string>("ALL");
	const [filteredCount, setFilteredCount] = useState<Number>(matches.length);
	const { t } = useLanguage();

	const { groups, stages } = useMemo(() => {
		const all = Array.from(new Set(matches.map((m) => m.groupOrStage))).sort();
		return {
			groups: all.filter((v) => v.toLowerCase().startsWith("grupo")),
			stages: all.filter((v) => !v.toLowerCase().startsWith("grupo")),
		};
	}, [matches]);

	const applyFilters = (
		newFilter: FilterType = filter,
		newSearch: string = search,
		newGroup: string = selectedGroup,
		newStage: string = selectedStage,
	) => {
		const filtered = matches.filter((match) => {
			const matchesStatus =
				newFilter === "ALL"
					? true
					: newFilter === "PENDING"
						? match.status === "SCHEDULED"
						: newFilter === "LIVE"
							? match.status === "LIVE"
							: match.status === "FINISHED";

			const matchesGroup =
				newGroup === "ALL" ? true : match.groupOrStage === newGroup;
			const matchesStage =
				newStage === "ALL" ? true : match.groupOrStage === newStage;

			return (
				matchesStatus &&
				matchesGroup &&
				matchesStage &&
				matchesSearch(match, newSearch)
			);
		});

		setFilteredCount(filtered.length);
		onFilteredMatchesChange(filtered);
	};

	const handleFilterChange = (newFilter: FilterType) => {
		setFilter(newFilter);
		applyFilters(newFilter);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value || "";
		setSearch(searchValue);
		applyFilters(filter, searchValue);
	};

	const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value;
		setSelectedGroup(val);
		setSelectedStage("ALL");
		applyFilters(filter, search, val, "ALL");
	};

	const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value;
		setSelectedStage(val);
		setSelectedGroup("ALL");
		applyFilters(filter, search, "ALL", val);
	};

	const filterLabels: Record<FilterType, string> = {
		ALL: t("fixtureNav_all"),
		PENDING: t("fixtureNav_pending"),
		LIVE: t("fixtureNav_live"),
		FINISHED: t("fixtureNav_finished"),
	};

	return (
		<div className="flex flex-col gap-4 border-b border-slate-800 pb-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
					{(["ALL", "PENDING", "LIVE", "FINISHED"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => handleFilterChange(tab)}
							className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
								filter === tab
									? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
									: "text-slate-400 hover:text-slate-200"
							}`}
						>
							{filterLabels[tab]}
						</button>
					))}
				</div>

				<span className="text-xs text-slate-400">
					{t("fixtureNav_count", {
						count: filteredCount as ReactNode as number,
					})}
				</span>
			</div>

			<div className="flex flex-wrap gap-3">
				{/* Search */}
				<div className="relative flex-1 min-w-[200px]">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
					>
						<path
							fillRule="evenodd"
							d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
							clipRule="evenodd"
						/>
					</svg>
					<input
						type="text"
						value={search}
						onChange={handleSearchChange}
						placeholder={t("fixtureNav_searchPlaceholder")}
						className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
					/>
					{search && (
						<button
							onClick={() => {
								setSearch("");
								applyFilters(filter, "");
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-4 h-4"
							>
								<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
							</svg>
						</button>
					)}
				</div>

				{/* Group dropdown */}
				{groups.length > 0 && (
					<div className="relative">
						<select
							value={selectedGroup}
							onChange={handleGroupChange}
							className={`appearance-none bg-slate-900/60 border rounded-xl px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all cursor-pointer ${
								selectedGroup !== "ALL"
									? "border-amber-500/60 text-amber-400"
									: "border-slate-800 text-slate-200"
							}`}
						>
							<option value="ALL">{t("fixtureNav_allGroups")}</option>
							{groups.map((group) => (
								<option key={group} value={group}>
									{group}
								</option>
							))}
						</select>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
						>
							<path
								fillRule="evenodd"
								d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				)}

				{/* Stage dropdown */}
				{stages.length > 0 && (
					<div className="relative">
						<select
							value={selectedStage}
							onChange={handleStageChange}
							className={`appearance-none bg-slate-900/60 border rounded-xl px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all cursor-pointer ${
								selectedStage !== "ALL"
									? "border-amber-500/60 text-amber-400"
									: "border-slate-800 text-slate-200"
							}`}
						>
							<option value="ALL">{t("fixtureNav_allStages")}</option>
							{stages.map((stage) => (
								<option key={stage} value={stage}>
									{stage}
								</option>
							))}
						</select>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
						>
							<path
								fillRule="evenodd"
								d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				)}
			</div>
		</div>
	);
}
