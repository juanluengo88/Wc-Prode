"use client";

import React, { useState, useEffect } from "react";
import { Match, Prediction } from "../../lib/mockData";
import { useServerTime } from "@/hooks/useServerTime";
import { teamsAreDefined } from "@/lib/matchUtils";
import { useRouter } from "next/navigation";
import { Team } from "@/lib/footballDataApi";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import { useLanguage } from "@/context/LanguageContext";
import { localizeGroupOrStage } from "@/lib/translations";
import CommunityPredictions from "@/components/CommunityPredictions";
import LineupPitch from "@/components/LineupPitch";
import type { OtherPrediction } from "@/app/api/matches/[id]/predictions/route";

interface MatchDetailViewProps {
	match: Match;
	teams: Team[];
	prediction: Prediction | undefined;
	otherPredictions?: OtherPrediction[];
	onSavePrediction: (
		matchId: string,
		predictHome: number | null,
		predictAway: number | null,
		prePictPenalties: boolean,
		predictPenaltiesWinner: "HOME_TEAM" | "AWAY_TEAM" | null,
	) => Promise<void>;
	onBack: () => void;
}

export default function MatchDetailView({
	match,
	teams,
	prediction,
	otherPredictions,
	onSavePrediction,
	onBack,
}: MatchDetailViewProps) {
	const router = useRouter();
	const { t, lang, locale } = useLanguage();
	const [homeScore, setHomeScore] = useState(
		prediction?.predictHome?.toString() ?? "0",
	);
	const [awayScore, setAwayScore] = useState(
		prediction?.predictAway?.toString() ?? "0",
	);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [timeLeftStr, setTimeLeftStr] = useState("");
	const [isLocked, setIsLocked] = useState(false);
	const [lastDiff, setLastDiff] = useState(0);
	const [predictPenalties, setPredictPenalties] = useState(
		prediction?.predictPenalties ?? false,
	);
	const [predictPenaltiesWinner, setPredictPenaltiesWinner] = useState<
		"HOME_TEAM" | "AWAY_TEAM" | null
	>(prediction?.predictPenaltiesWinner ?? null);
	const getTime = useServerTime();

	const { data: espn } = useMatchDetails(match.espnMatchId || match.matchId);

	useEffect(() => {
		if (prediction) {
			setHomeScore(prediction.predictHome?.toString() ?? "0");
			setAwayScore(prediction.predictAway?.toString() ?? "0");
			setPredictPenalties(prediction.predictPenalties ?? false);
			setPredictPenaltiesWinner(prediction.predictPenaltiesWinner ?? null);
		}
	}, [prediction]);

	useEffect(() => {
		const calculateTimeLeft = () => {
			const matchTime = new Date(match.dateTime).getTime();
			const now = getTime();
			const diff = matchTime - now;

			if (diff <= 15 * 60 * 1000 || match.status !== "SCHEDULED") {
				setIsLocked(true);
				setTimeLeftStr(t("matchDetail_closed"));
				if (match.status === "LIVE" && lastDiff > 5 * 60) {
					router.refresh();
					setLastDiff(0);
					return;
				}
				setLastDiff(-1 * diff);
				return;
			}

			setIsLocked(false);

			const days = Math.floor(diff / (24 * 60 * 60 * 1000));
			const hours = Math.floor(
				(diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
			);
			const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
			const seconds = Math.floor((diff % (60 * 1000)) / 1000);

			const parts = [];
			if (days > 0) parts.push(`${days}d`);
			if (hours > 0 || days > 0) parts.push(`${hours}h`);
			parts.push(`${minutes}m`);
			parts.push(`${seconds}s`);

			setTimeLeftStr(t("matchDetail_closesIn", { time: parts.join(" ") }));
		};

		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);
		return () => clearInterval(timer);
	}, [match, t]);

	const handleRedirectionToTeam = (teamName: string) => {
		const teamInDB = teams.find((t) => t.name === teamName);
		if (teamInDB?.teamId) {
			router.push(`/team/${teamInDB.teamId}`);
		} else {
			console.warn(
				`No se encontró el teamId en la DB para el equipo: ${teamName}`,
			);
		}
	};

	const handleInputChange = (team: "home" | "away", value: string) => {
		if (value !== "" && !/^\d+$/.test(value)) return;
		if (team === "home") setHomeScore(value);
		else setAwayScore(value);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();

		if (homeScore === "" || awayScore === "" || isLocked) return;

		setIsSaving(true);
		try {
			await onSavePrediction(
				match.matchId,
				predictPenalties ? null : parseInt(homeScore),
				predictPenalties ? null : parseInt(awayScore),
				predictPenalties,
				predictPenalties ? predictPenaltiesWinner : null,
			);
			setIsSaving(false);
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2500);
		} catch {
			setIsSaving(false);
		}
	};

	const isFormComplete = predictPenalties
		? predictPenaltiesWinner !== null
		: homeScore !== "" && awayScore !== "";

	return (
		<div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-16">
			<header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-4 sm:px-8">
				<div className="max-w-4xl mx-auto flex items-center gap-4">
					<button
						onClick={onBack}
						className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700/60"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="w-5 h-5 text-amber-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
							/>
						</svg>
					</button>
					<div>
						<h2 className="text-lg font-extrabold text-white">
							{t("matchDetail_title")}
						</h2>
						<p className="text-xs text-slate-400">
							{localizeGroupOrStage(match.groupOrStage, lang)}
						</p>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8 sm:px-8 space-y-6">
				{/* Banner with flags */}
				<div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border border-slate-800 p-4 sm:p-8 shadow-2xl flex flex-col items-center">
					<div className="absolute top-[-30%] left-[50%] -translate-x-[50%] w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

					<div className="text-center mb-6">
						<span
							className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase border ${isLocked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"}`}
						>
							{timeLeftStr}
						</span>
						<span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-3">
							{new Date(match.dateTime).toLocaleDateString(locale, {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}{" "}
							hs
						</span>
					</div>

					<div className="w-full flex items-center justify-between gap-2 sm:gap-6 py-4 sm:py-6 max-w-xl">
						{/* Home Team */}
						<div className="flex-1 flex flex-col items-center text-center gap-3">
							{!match.teamHome?.trim() ? (
								<div className="w-20 h-14 sm:w-28 sm:h-20 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
									<span className="text-xl text-slate-600 font-bold">?</span>
								</div>
							) : (
								<img
									src={match.teamHomeFlag}
									alt={match.teamHome}
									className="w-20 h-14 sm:w-28 sm:h-20 object-cover rounded-2xl border border-slate-700/60 shadow-xl"
								/>
							)}
							<div className="space-y-1">
								<h3 className={`text-sm sm:text-2xl font-black ${!match.teamHome?.trim() ? "text-slate-500 italic" : "text-white"}`}>
									{!match.teamHome?.trim() ? t("card_tbd") : match.teamHome}
								</h3>
								<span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
									{t("matchDetail_home")}
								</span>
							</div>
							<button
								type="button"
								onClick={() => handleRedirectionToTeam(match.teamHome)}
								disabled={!match.teamHome?.trim()}
								className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-500/85 hover:text-amber-400 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-3.5 h-3.5"
								>
									<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
									<path
										fillRule="evenodd"
										d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
										clipRule="evenodd"
									/>
								</svg>
								{t("matchDetail_viewSquad")}
							</button>
						</div>

						{/* Score */}
						<div className="flex flex-col items-center shrink-0">
							{match.status === "FINISHED" || match.status === "LIVE" ? (
								<div className="text-center">
									<div className="flex items-center gap-2 sm:gap-4 bg-slate-950/80 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl border border-slate-800">
										<span className="text-2xl sm:text-5xl font-black text-white">
											{match.scoreHome}
										</span>
										<span className="text-amber-500 font-extrabold text-xl sm:text-2xl">
											:
										</span>
										<span className="text-2xl sm:text-5xl font-black text-white">
											{match.scoreAway}
										</span>
									</div>
									{match.scorePenaltiesHome !== null &&
									match.scorePenaltiesAway !== null && (
										<div className="mt-2 flex flex-col items-center gap-1">
											<span className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
												{t("matchDetail_penalties")}
											</span>
											<div className="flex items-center gap-2 bg-violet-950/40 px-3 py-1.5 rounded-xl border border-violet-500/25">
												<span className="text-lg sm:text-2xl font-black text-violet-300">
													{match.scorePenaltiesHome}
												</span>
												<span className="text-violet-500 font-extrabold text-base">
													-
												</span>
												<span className="text-lg sm:text-2xl font-black text-violet-300">
													{match.scorePenaltiesAway}
												</span>
											</div>
										</div>
									)}
								{match.status === "LIVE" && (
										<span className="inline-flex items-center gap-1.5 mt-2 bg-red-500/10 text-red-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-red-500/25 animate-pulse">
											<span className="w-1.5 h-1.5 rounded-full bg-red-500" />{" "}
											{t("matchDetail_live")}
										</span>
									)}
								</div>
							) : (
								<div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-slate-500 shadow-inner">
									VS
								</div>
							)}
						</div>

						{/* Away Team */}
						<div className="flex-1 flex flex-col items-center text-center gap-3">
							{!match.teamAway?.trim() ? (
								<div className="w-20 h-14 sm:w-28 sm:h-20 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
									<span className="text-xl text-slate-600 font-bold">?</span>
								</div>
							) : (
								<img
									src={match.teamAwayFlag}
									alt={match.teamAway}
									className="w-20 h-14 sm:w-28 sm:h-20 object-cover rounded-2xl border border-slate-700/60 shadow-xl"
								/>
							)}
							<div className="space-y-1">
								<h3 className={`text-sm sm:text-2xl font-black ${!match.teamAway?.trim() ? "text-slate-500 italic" : "text-white"}`}>
									{!match.teamAway?.trim() ? t("card_tbd") : match.teamAway}
								</h3>
								<span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
									{t("matchDetail_away")}
								</span>
							</div>
							<button
								type="button"
								onClick={() => handleRedirectionToTeam(match.teamAway)}
								disabled={!match.teamAway?.trim()}
								className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-500/85 hover:text-amber-400 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-3.5 h-3.5"
								>
									<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
									<path
										fillRule="evenodd"
										d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
										clipRule="evenodd"
									/>
								</svg>
								{t("matchDetail_viewSquad")}
							</button>
						</div>
					</div>
				</div>

				{/* Prediction Form */}
				{match.status === "SCHEDULED" && (
					<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl">
						{!teamsAreDefined(match) ? (
							<div className="flex flex-col items-center gap-3 py-4">
								<p className="text-sm font-bold text-slate-300 text-center">
									{t("matchDetail_pendingTeams")}
								</p>
							</div>
						) : (
							<>
								<h4 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider text-center">
									{isLocked
										? t("matchDetail_registeredPrediction")
										: t("matchDetail_enterPrediction")}
								</h4>

								<form
									onSubmit={handleSave}
									className="max-w-md mx-auto space-y-6 flex flex-col items-center"
								>
									{/* Toggle penales */}
									{!isLocked && !match.groupOrStage.startsWith("Grupo") && (
										<div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3 w-full justify-between">
											<div className="flex flex-col">
												<span className="text-sm font-bold text-slate-200">
													¿Va a penales?
												</span>
												<span className="text-[10px] text-slate-500">
													Solo para fases eliminatorias
												</span>
											</div>
											<button
												type="button"
												onClick={() => {
													const turningOn = !predictPenalties;
													setPredictPenalties(turningOn);
													setPredictPenaltiesWinner(null);
													if (turningOn) {
														setHomeScore("");
														setAwayScore("");
													} else {
														setHomeScore("0");
														setAwayScore("0");
													}
												}}
												className={`relative w-12 h-6 rounded-full transition-colors duration-200 border ${predictPenalties ? "bg-violet-600 border-violet-500" : "bg-slate-800 border-slate-700"}`}
											>
												<span
													className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${predictPenalties ? "translate-x-6" : "translate-x-0"}`}
												/>
											</button>
										</div>
									)}

									{predictPenalties ? (
										/* Selector de ganador en penales */
										<div className="w-full space-y-3">
											<p className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
												¿Quién gana en penales?
											</p>
											<div className="grid grid-cols-2 gap-3">
												<button
													type="button"
													disabled={isLocked}
													onClick={() => setPredictPenaltiesWinner("HOME_TEAM")}
													className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${predictPenaltiesWinner === "HOME_TEAM" ? "border-violet-500 bg-violet-500/15 text-violet-300" : "border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600"}`}
												>
													<img
														src={match.teamHomeFlag}
														alt={match.teamHome}
														className="w-10 h-7 object-cover rounded"
													/>
													{match.teamHome}
												</button>
												<button
													type="button"
													disabled={isLocked}
													onClick={() => setPredictPenaltiesWinner("AWAY_TEAM")}
													className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${predictPenaltiesWinner === "AWAY_TEAM" ? "border-violet-500 bg-violet-500/15 text-violet-300" : "border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600"}`}
												>
													<img
														src={match.teamAwayFlag}
														alt={match.teamAway}
														className="w-10 h-7 object-cover rounded"
													/>
													{match.teamAway}
												</button>
											</div>
										</div>
									) : (
										/* Inputs de score normales */
										<div className="flex items-center gap-6 justify-center">
											<input
												type="text"
												maxLength={2}
												value={homeScore}
												disabled={isLocked}
												onChange={(e) =>
													handleInputChange("home", e.target.value)
												}
												placeholder="0"
												className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-center font-black text-3xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
											/>
											<span className="text-slate-600 font-black text-3xl">
												-
											</span>
											<input
												type="text"
												maxLength={2}
												value={awayScore}
												disabled={isLocked}
												onChange={(e) =>
													handleInputChange("away", e.target.value)
												}
												placeholder="0"
												className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-center font-black text-3xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
											/>
										</div>
									)}

									{showSuccess && (
										<div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-semibold">
											{t("matchDetail_successSaved")}
										</div>
									)}

									{!isLocked && (
										<button
											type="submit"
											disabled={!isFormComplete || isSaving}
											className="cursor-pointer w-full max-w-xs py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-yellow-500 active:scale-[0.98] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
										>
											{isSaving ? (
												<span>{t("matchDetail_btnSaving")}</span>
											) : (
												<span>
													{prediction
														? t("matchDetail_btnUpdate")
														: t("matchDetail_btnSave")}
												</span>
											)}
										</button>
									)}
								</form>
							</>
						)}
					</div>
				)}

				{/* Points badge */}
				{match.status === "FINISHED" &&
					prediction &&
					prediction.pointsEarned !== null && (
						<div className="bg-slate-900/60 border border-slate-850 p-4 rounded-3xl text-center">
							<span className="text-sm font-bold text-slate-400">
								{t("matchDetail_pointsEarned")}{" "}
								<strong className="text-amber-400">
									+{prediction.pointsEarned}
								</strong>
							</span>
						</div>
					)}

				{/* Community predictions */}
				{["FINISHED", "LIVE"].includes(match.status) &&
					otherPredictions &&
					otherPredictions.length > 0 && (
						<CommunityPredictions predictions={otherPredictions} />
					)}

				{/* Pre-match stats */}
				{match.status === "SCHEDULED" && espn && (
					<div className="space-y-6">
						{espn.probabilidadesPrediccion?.tieneOdds && (
							<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
								<div>
									<h4 className="text-sm font-bold text-white uppercase tracking-wide">
										{t("matchDetail_marketProbTitle")}
									</h4>
									<p className="text-xs text-slate-400">
										{t("matchDetail_marketProbSubtitle")}
									</p>
								</div>
								<div className="space-y-2">
									<div className="w-full flex h-4 rounded-full overflow-hidden bg-slate-950 border border-slate-800">
										<div
											style={{
												width: `${espn.probabilidadesPrediccion.local}%`,
											}}
											className="bg-indigo-500"
										/>
										<div
											style={{
												width: `${espn.probabilidadesPrediccion.empate}%`,
											}}
											className="bg-slate-600"
										/>
										<div
											style={{
												width: `${espn.probabilidadesPrediccion.visitante}%`,
											}}
											className="bg-amber-500"
										/>
									</div>
									<div className="grid grid-cols-3 text-center text-xs p-1">
										<div className="flex flex-col">
											<span className="text-indigo-400 font-bold">
												{match.teamHome}
											</span>
											<span className="text-white font-black text-base">
												{espn.probabilidadesPrediccion.local}%
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-slate-400 font-bold">
												{t("matchDetail_draw")}
											</span>
											<span className="text-white font-black text-base">
												{espn.probabilidadesPrediccion.empate}%
											</span>
										</div>
										<div className="flex flex-col">
											<span className="text-amber-400 font-bold">
												{match.teamAway}
											</span>
											<span className="text-white font-black text-base">
												{espn.probabilidadesPrediccion.visitante}%
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Recent form */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{[
								{
									team: match.teamHome,
									racha: espn.previaEstadisticas?.rachaHome,
									side: "home",
								},
								{
									team: match.teamAway,
									racha: espn.previaEstadisticas?.rachaAway,
									side: "away",
								},
							].map(({ team, racha, side }) => (
								<div
									key={side}
									className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-3"
								>
									<h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
										{t("matchDetail_recentMatches", { team: team?.trim() || t("card_tbd") })}
									</h4>
									<div className="space-y-2">
										{Array.isArray(racha) ? (
											racha.map((r, idx) => (
												<div
													key={idx}
													className="flex justify-between items-center bg-slate-950/70 border border-slate-900 px-3 py-2.5 rounded-xl text-xs"
												>
													<span className="text-slate-300 font-semibold truncate w-[110px] sm:w-[130px] text-left">
														vs {r.oponente}
													</span>
													<span className="font-mono text-slate-400 font-bold text-center flex-1">
														{r.score}
													</span>
													<span
														className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ml-2 ${r.resultado === "G" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : r.resultado === "P" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400"}`}
													>
														{r.resultado}
													</span>
												</div>
											))
										) : (
											<p className="text-xs text-slate-600">
												{t("matchDetail_noData")}
											</p>
										)}
									</div>
								</div>
							))}
						</div>

						{/* H2H */}
						{Array.isArray(espn.previaEstadisticas?.historialH2H) &&
							espn.previaEstadisticas.historialH2H.length > 0 && (
								<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-3">
									<h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
										{t("matchDetail_h2hTitle")}
									</h4>
									<div className="grid grid-cols-1 gap-2">
										{espn.previaEstadisticas.historialH2H.map((h, idx) => (
											<div
												key={idx}
												className="flex justify-between items-center bg-slate-950/50 border border-slate-900/60 px-4 py-3 rounded-2xl text-xs"
											>
												<div className="flex flex-col gap-0.5">
													<span className="text-slate-100 font-extrabold text-sm sm:text-base tracking-wide">
														{h.partido}
													</span>
													<span className="text-[10px] text-slate-500 font-semibold">
														{h.competencia}
													</span>
												</div>
												<div className="text-right flex flex-col items-end gap-1.5 shrink-0">
													<span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-bold font-mono border border-slate-800/40">
														{h.fecha}
													</span>
													{h.ganador === "Empate" ? (
														<span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-800/30 px-1.5 py-0.5 rounded">
															{t("matchDetail_draw")}
														</span>
													) : (
														<span className="text-[10px] text-amber-500 font-black uppercase bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
															{t("matchDetail_winner")}{" "}
															<span className="text-white font-black">
																{h.ganador}
															</span>
														</span>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
					</div>
				)}

				{/* Live / Finished */}
				{["FINISHED", "LIVE"].includes(match.status) && espn && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
						{/* Left: Lineup pitch */}
						{espn.detallesTacticos?.formacionHome &&
							Array.isArray(espn.detallesTacticos.titularesHome) &&
							espn.detallesTacticos.titularesHome.length > 0 ? (
							<LineupPitch
								formacionHome={espn.detallesTacticos.formacionHome}
								formacionAway={espn.detallesTacticos.formacionAway}
								titularesHome={espn.detallesTacticos.titularesHome}
								titularesAway={espn.detallesTacticos.titularesAway}
								teamHome={match.teamHome}
								teamAway={match.teamAway}
							/>
						) : (
							/* Fallback: only formation numbers when no lineup data */
							<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
								<h4 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
									{t("matchDetail_tacticsTitle")}
								</h4>
								<div className="flex justify-around items-center bg-slate-950/80 rounded-2xl border border-slate-900 p-4 font-mono text-center">
									<div className="flex flex-col">
										<span className="text-slate-500 text-[10px] uppercase font-bold">
											{match.teamHome}
										</span>
										<span className="text-xl font-black text-indigo-400 mt-1">
											{espn.detallesTacticos?.formacionHome || "N/A"}
										</span>
									</div>
									<div className="w-px h-10 bg-slate-800" />
									<div className="flex flex-col">
										<span className="text-slate-500 text-[10px] uppercase font-bold">
											{match.teamAway}
										</span>
										<span className="text-xl font-black text-amber-400 mt-1">
											{espn.detallesTacticos?.formacionAway || "N/A"}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Right: Timeline */}
						{Array.isArray(espn.eventosEnVivo) &&
							espn.eventosEnVivo.length > 0 && (
								<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
									<h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
										{t("matchDetail_timelineTitle")}
									</h4>
									<div className="relative border-l border-slate-800 ml-4 pl-6 space-y-5">
										{espn.eventosEnVivo.map((evt, idx) => (
											<div key={idx} className="relative flex flex-col gap-1">
												<span
													className={`absolute left-[-31px] top-0 w-3 h-3 rounded-full border-2 bg-slate-950 ${evt.tipo === "gol" ? "border-emerald-500" : "border-slate-700"}`}
												/>
												<div className="flex items-center gap-2">
													<span
														className={`px-1.5 py-0.5 rounded font-black text-[10px] uppercase leading-none ${evt.tipo === "gol" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-slate-400"}`}
													>
														{evt.tiempo}
													</span>
													<span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
														{evt.tipo.replace("-", " ")}
													</span>
												</div>
												<p className="text-slate-300 text-sm leading-relaxed">
													{evt.descripcion}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
					</div>
				)}
			</main>
		</div>
	);
}
