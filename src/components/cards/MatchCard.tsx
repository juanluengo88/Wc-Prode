"use client";
import React from "react";
import { Match, Prediction } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { localizeGroupOrStage } from "@/lib/translations";

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
	onInputChange?: (
		matchId: string,
		team: "home" | "away",
		value: string,
	) => void;
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
	const { t, lang, locale } = useLanguage();

	const dateObj = new Date(match.dateTime);
	const formattedDate = dateObj
		.toLocaleDateString(locale, {
			weekday: "short",
			day: "numeric",
			month: "short",
		})
		.replace(".", "");
	const formattedTime = dateObj.toLocaleTimeString(locale, {
		hour: "2-digit",
		minute: "2-digit",
	});

	const tienePrediccionHecha = pred !== undefined && pred !== null;

	return (
		<div
			onClick={() => onSelectMatch(match.matchId)}
			className={`group relative flex flex-col justify-between backdrop-blur-md p-5 rounded-2xl border transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01] ${
				tienePrediccionHecha && match.status === "SCHEDULED"
					? "bg-slate-900/70 border-indigo-500/30 hover:border-indigo-500/50"
					: "bg-slate-900/50 border-slate-800 hover:border-slate-700"
			}`}
		>
			{/* Predicted badge */}
			{tienePrediccionHecha && match.status === "SCHEDULED" && (
				<div className="absolute -top-2 -right-1 flex items-center gap-1 bg-indigo-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md shadow-indigo-600/20 border border-indigo-400/30 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						className="w-2.5 h-2.5"
					>
						<path
							fillRule="evenodd"
							d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
							clipRule="evenodd"
						/>
					</svg>
					{t("card_predicted")}
				</div>
			)}

			{/* Card Header */}
			<div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
				<span className="text-xs font-semibold text-amber-500/85 tracking-wide uppercase">
					{localizeGroupOrStage(match.groupOrStage, lang)}
				</span>
				<div className="flex items-center gap-1.5">
					{match.status === "LIVE" && (
						<span className="flex items-center gap-1 bg-red-500/15 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/35">
							<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
							{t("card_live")}
						</span>
					)}
					{match.status === "FINISHED" && (
						<span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-700/50">
							{t("card_finished")}
						</span>
					)}
					{match.status === "SCHEDULED" && tbdTeams && (
						<span className="flex items-center gap-1 bg-slate-700/50 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-slate-600/40">
							{t("card_tbd")}
						</span>
					)}
					{match.status === "SCHEDULED" &&
						!tbdTeams &&
						(locked ? (
							<span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
								{t("card_closed")}
							</span>
						) : (
							<span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
								{t("card_open")}
							</span>
						))}
				</div>
			</div>

			{/* Teams and Scores */}
			<div className="flex items-center justify-between gap-4 py-2">
				{/* Home */}
				<div className="flex-1 flex flex-col items-center text-center gap-2">
					{!match.teamHome?.trim() ? (
						<div className="w-12 h-8 rounded-md bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
							<span className="text-[10px] text-slate-600 font-bold">?</span>
						</div>
					) : (
						<img
							src={match.teamHomeFlag}
							alt={match.teamHome}
							className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
							onError={(e) => {
								(e.target as HTMLElement).style.display = "none";
							}}
						/>
					)}
					<span
						className={`text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none ${!match.teamHome?.trim() ? "text-slate-500 italic" : ""}`}
					>
						{!match.teamHome?.trim() ? t("card_tbd") : match.teamHome}
					</span>
				</div>

				{/* Score / Inputs */}
				<div
					className="flex items-center gap-2"
					onClick={(e) => e.stopPropagation()}
				>
					{tbdTeams ? (
						<span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide text-center leading-tight px-1">
							{t("card_teamsPending")}
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
						tienePrediccionHecha ? (
							<div className="flex flex-col items-center gap-1">
								<div className="flex items-center gap-2 bg-indigo-950/40 px-3 py-1 rounded-xl border border-indigo-500/20 shadow-inner">
									<span className="text-sm font-black text-indigo-300">
										{pred.predictHome}
									</span>
									<span className="text-indigo-500/60 text-xs font-bold">
										:
									</span>
									<span className="text-sm font-black text-indigo-300">
										{pred.predictAway}
									</span>
								</div>
								<span className="text-[8px] text-indigo-400/80 font-semibold uppercase tracking-wider">
									{t("card_yourBet")}
								</span>
							</div>
						) : (
							<div className="flex items-center gap-3">
								<span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
									-
								</span>
								<span className="text-slate-500 font-bold text-sm">:</span>
								<span className="text-xl font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500">
									-
								</span>
							</div>
						)
					) : (
						<div className="flex items-center gap-1.5">
							<input
								type="text"
								maxLength={2}
								value={homeVal}
								disabled={locked}
								placeholder={
									tienePrediccionHecha ? pred.predictHome.toString() : "-"
								}
								onChange={(e) =>
									onInputChange?.(match.matchId, "home", e.target.value)
								}
								className={`w-10 h-10 rounded-xl bg-slate-950 border text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed ${
									tienePrediccionHecha && !homeVal
										? "border-indigo-500/30 text-indigo-300 placeholder-indigo-300/60"
										: "border-slate-800 text-white"
								}`}
							/>
							<span className="text-slate-600 font-bold">-</span>
							<input
								type="text"
								maxLength={2}
								value={awayVal}
								disabled={locked}
								placeholder={
									tienePrediccionHecha ? pred.predictAway.toString() : "-"
								}
								onChange={(e) =>
									onInputChange?.(match.matchId, "away", e.target.value)
								}
								className={`w-10 h-10 rounded-xl bg-slate-950 border text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed ${
									tienePrediccionHecha && !awayVal
										? "border-indigo-500/30 text-indigo-300 placeholder-indigo-300/60"
										: "border-slate-800 text-white"
								}`}
							/>
						</div>
					)}
				</div>

				{/* Away */}
				<div className="flex-1 flex flex-col items-center text-center gap-2">
					{!match.teamAway?.trim() ? (
						<div className="w-12 h-8 rounded-md bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
							<span className="text-[10px] text-slate-600 font-bold">?</span>
						</div>
					) : (
						<img
							src={match.teamAwayFlag}
							alt={match.teamAway}
							className="w-12 h-8 object-cover rounded-md shadow-md border border-slate-800"
							onError={(e) => {
								(e.target as HTMLElement).style.display = "none";
							}}
						/>
					)}
					<span
						className={`text-xs sm:text-sm font-semibold truncate max-w-[100px] sm:max-w-none ${!match.teamAway?.trim() ? "text-slate-500 italic" : ""}`}
					>
						{!match.teamAway?.trim() ? t("card_tbd") : match.teamAway}
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
								{t("card_inProgress")}
							</span>
						)}
						{match.status === "FINISHED" && (
							<span className="text-[10px] text-slate-500 font-semibold uppercase">
								{t("card_finished")}
							</span>
						)}
						{match.status === "SCHEDULED" && tbdTeams && (
							<span className="text-[10px] text-slate-500 italic font-semibold">
								{t("card_teamsPendingConfirm")}
							</span>
						)}
						{match.status === "SCHEDULED" && !tbdTeams && (
							<span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
								{tienePrediccionHecha ? t("card_modify") : t("card_notStarted")}
							</span>
						)}
					</>
				) : (
					<div onClick={(e) => e.stopPropagation()}>
						{tbdTeams ? (
							<span className="text-[10px] text-slate-500 italic font-semibold">
								{t("card_teamsPendingConfirm")}
							</span>
						) : match.status === "FINISHED" ? (
							pred && pred.pointsEarned !== null ? (
								<div
									className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${getPointsBadgeColor?.(pred.pointsEarned)}`}
								>
									{pred.pointsEarned === 3 && t("card_exact")}
									{pred.pointsEarned === 1 && t("card_partial")}
									{pred.pointsEarned === 0 && t("card_wrong")}
								</div>
							) : (
								<span className="text-[10px] text-slate-500 uppercase font-semibold">
									{t("card_noPrediction")}
								</span>
							)
						) : match.status === "LIVE" ? (
							pred ? (
								<span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
									Pronóstico: {pred.predictHome}-{pred.predictAway}
								</span>
							) : (
								<span className="text-[10px] text-red-400">
									{t("card_noPrediction")}
								</span>
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
									<svg
										className="animate-spin h-3.5 w-3.5 text-slate-950"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								) : successId === match.matchId ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-3.5 h-3.5"
									>
										<path
											fillRule="evenodd"
											d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
											clipRule="evenodd"
										/>
									</svg>
								) : tienePrediccionHecha ? (
									t("card_btnUpdate")
								) : (
									t("card_btnSave")
								)}
							</button>
						) : pred ? (
							<span className="text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30">
								Pronóstico: {pred.predictHome}-{pred.predictAway}
							</span>
						) : (
							<span className="text-[10px] text-slate-500 uppercase font-semibold">
								{t("card_closedNoPrediction")}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
