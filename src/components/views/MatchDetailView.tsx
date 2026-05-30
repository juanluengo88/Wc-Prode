"use client";

import React, { useState, useEffect } from "react";
import { Match, Prediction } from "../../lib/mockData";
import { useServerTime } from "@/hooks/useServerTime";

interface MatchDetailViewProps {
	match: Match;
	prediction: Prediction | undefined;
	onSavePrediction: (
		matchId: string,
		predictHome: number,
		predictAway: number,
	) => Promise<void>;
	onBack: () => void;
}

export default function MatchDetailView({
	match,
	prediction,
	onSavePrediction,
	onBack,
}: MatchDetailViewProps) {
	const [homeScore, setHomeScore] = useState(
		prediction?.predictHome.toString() ?? "",
	);
	const [awayScore, setAwayScore] = useState(
		prediction?.predictAway.toString() ?? "",
	);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [timeLeftStr, setTimeLeftStr] = useState("");
	const [isLocked, setIsLocked] = useState(false);
	const getTime = useServerTime();

	// Sync state if prediction changes
	useEffect(() => {
		if (prediction) {
			setHomeScore(prediction.predictHome.toString());
			setAwayScore(prediction.predictAway.toString());
		}
	}, [prediction]);

	// Handle countdown timer & lock status check
	useEffect(() => {
		const calculateTimeLeft = () => {
			const matchTime = new Date(match.dateTime).getTime();
			const now = getTime();
			const diff = matchTime - now;

			// Lock if less than 15 minutes left (900000 ms) or if status is not SCHEDULED
			if (diff <= 15 * 60 * 1000 || match.status !== "SCHEDULED") {
				setIsLocked(true);
				setTimeLeftStr("PRONÓSTICOS CERRADOS");
				return;
			}

			setIsLocked(false);

			// Format remaining time
			const days = Math.floor(diff / (24 * 60 * 60 * 1000));
			const hours = Math.floor(
				(diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
			);
			const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
			const seconds = Math.floor((diff % (60 * 1000)) / 1000);

			let parts = [];
			if (days > 0) parts.push(`${days}d`);
			if (hours > 0 || days > 0) parts.push(`${hours}h`);
			parts.push(`${minutes}m`);
			parts.push(`${seconds}s`);

			setTimeLeftStr(`Cierra en: ${parts.join(" ")}`);
		};

		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);
		return () => clearInterval(timer);
	}, [match]);

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
				parseInt(homeScore),
				parseInt(awayScore),
			);
			setIsSaving(false);
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2500);
		} catch {
			setIsSaving(false);
		}
	};

	const isFormComplete = homeScore !== "" && awayScore !== "";

	return (
		<div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-16">
			{/* Detail Header */}
			<header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-4 sm:px-8">
				<div className="max-w-4xl mx-auto flex items-center gap-4">
					<button
						onClick={onBack}
						className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700/60"
						title="Volver"
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
							Detalle de Partido
						</h2>
						<p className="text-xs text-slate-400">{match.groupOrStage}</p>
					</div>
				</div>
			</header>

			{/* Main Content Card */}
			<main className="max-w-4xl mx-auto px-4 py-8 sm:px-8 space-y-6">
				{/* Banner with large flags */}
				<div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border border-slate-800 p-8 shadow-2xl flex flex-col items-center">
					<div className="absolute top-[-30%] left-[50%] -translate-x-[50%] w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

					{/* Time & Lock Banner */}
					<div className="text-center mb-6">
						<span
							className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase border ${
								isLocked
									? "bg-red-500/10 text-red-400 border-red-500/20"
									: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
							}`}
						>
							{timeLeftStr}
						</span>
						<span className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mt-3">
							{new Date(match.dateTime).toLocaleDateString("es-ES", {
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

					{/* Large flags and Name matchup */}
					<div className="w-full flex items-center justify-between gap-6 py-6 max-w-xl">
						{/* Home Team Visuals */}
						<div className="flex-1 flex flex-col items-center text-center gap-3">
							<div className="relative group">
								<div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
								<img
									src={match.teamHomeFlag}
									alt={match.teamHome}
									className="relative w-20 h-14 sm:w-28 sm:h-20 object-cover rounded-2xl border border-slate-700/60 shadow-xl"
								/>
							</div>
							<h3 className="text-lg sm:text-2xl font-black text-white">
								{match.teamHome}
							</h3>
							<span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
								Local
							</span>
						</div>

						{/* Score VS indicator */}
						<div className="flex flex-col items-center shrink-0">
							{match.status === "FINISHED" || match.status === "LIVE" ? (
								<div className="text-center">
									<div className="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
										<span className="text-3xl sm:text-5xl font-black text-white">
											{match.scoreHome}
										</span>
										<span className="text-amber-500 font-extrabold text-2xl">
											:
										</span>
										<span className="text-3xl sm:text-5xl font-black text-white">
											{match.scoreAway}
										</span>
									</div>
									{match.status === "LIVE" && (
										<span className="inline-flex items-center gap-1.5 mt-2 bg-red-500/10 text-red-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-red-500/25 animate-pulse">
											<span className="w-1.5 h-1.5 rounded-full bg-red-500" />
											Partido en curso
										</span>
									)}
								</div>
							) : (
								<div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-slate-500 shadow-inner">
									VS
								</div>
							)}
						</div>

						{/* Away Team Visuals */}
						<div className="flex-1 flex flex-col items-center text-center gap-3">
							<div className="relative group">
								<div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
								<img
									src={match.teamAwayFlag}
									alt={match.teamAway}
									className="relative w-20 h-14 sm:w-28 sm:h-20 object-cover rounded-2xl border border-slate-700/60 shadow-xl"
								/>
							</div>
							<h3 className="text-lg sm:text-2xl font-black text-white">
								{match.teamAway}
							</h3>
							<span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
								Visitante
							</span>
						</div>
					</div>
				</div>

				{/* Prediction Form Section */}
				{match.status === "SCHEDULED" && (
					<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl">
						<h4 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider text-center">
							{isLocked ? "Tu pronóstico registrado" : "Ingresa tu pronóstico"}
						</h4>

						<form
							onSubmit={handleSave}
							className="max-w-md mx-auto space-y-6 flex flex-col items-center"
						>
							{/* Form inputs */}
							<div className="flex items-center gap-6 justify-center">
								<div className="flex flex-col items-center gap-2">
									<span className="text-xs text-slate-400 font-semibold">
										{match.teamHome}
									</span>
									<input
										type="text"
										maxLength={2}
										value={homeScore}
										disabled={isLocked}
										onChange={(e) => handleInputChange("home", e.target.value)}
										placeholder="0"
										className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-center font-black text-3xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>

								<span className="text-slate-600 font-black text-3xl mt-6">
									-
								</span>

								<div className="flex flex-col items-center gap-2">
									<span className="text-xs text-slate-400 font-semibold">
										{match.teamAway}
									</span>
									<input
										type="text"
										maxLength={2}
										value={awayScore}
										disabled={isLocked}
										onChange={(e) => handleInputChange("away", e.target.value)}
										placeholder="0"
										className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-center font-black text-3xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
							</div>

							{/* Alert Feedback Messages */}
							{showSuccess && (
								<div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-semibold">
									¡Pronóstico guardado exitosamente!
								</div>
							)}

							{/* Actions */}
							{!isLocked ? (
								<button
									type="submit"
									disabled={!isFormComplete || isSaving}
									className="w-full max-w-xs py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-sm tracking-wide hover:from-amber-400 hover:to-yellow-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									{isSaving ? (
										<>
											<svg
												className="animate-spin h-5 w-5 text-slate-950"
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
											<span>Guardando...</span>
										</>
									) : (
										<span>
											{prediction
												? "Actualizar Pronóstico"
												: "Guardar Pronóstico"}
										</span>
									)}
								</button>
							) : (
								<div className="text-center p-3 text-xs text-slate-500 bg-slate-950/40 border border-slate-900 rounded-xl">
									Formulario bloqueado por inicio de partido o cierre de
									ventana.
								</div>
							)}
						</form>
					</div>
				)}

				{/* Finished points feedback banner */}
				{match.status === "FINISHED" && (
					<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl text-center space-y-3">
						<h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
							Resultado del Pronóstico
						</h4>
						{prediction ? (
							<div className="space-y-3">
								<p className="text-sm">
									Apostaste a un resultado de{" "}
									<strong className="text-white">
										{prediction.predictHome} - {prediction.predictAway}
									</strong>
									.
								</p>
								{prediction.pointsEarned !== null ? (
									<div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-950/40 border border-indigo-500/25">
										<span className="text-2xl font-black text-amber-400">
											+{prediction.pointsEarned}
										</span>
										<div className="text-left text-xs">
											<span className="block font-bold text-slate-200">
												{prediction.pointsEarned === 3 &&
													"Puntos por acierto EXACTO!"}
												{prediction.pointsEarned === 1 &&
													"Punto por acierto PARCIAL (Ganador/Empate)."}
												{prediction.pointsEarned === 0 &&
													"Sin puntos obtenidos."}
											</span>
											<span className="text-[10px] text-slate-400">
												Sumado a tu puntuación global
											</span>
										</div>
									</div>
								) : null}
							</div>
						) : (
							<p className="text-sm text-slate-500 italic">
								No registraste ningún pronóstico para este encuentro.
							</p>
						)}
					</div>
				)}

				{/* Community insights segment (PREMIUM UI feature) */}
				<div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
					<div>
						<h4 className="text-sm font-bold text-slate-200">
							Tendencias de la Comunidad
						</h4>
						<p className="text-xs text-slate-400">
							Distribución de los pronósticos de los otros participantes
						</p>
					</div>

					<div className="space-y-4">
						{/* Option 1: Home Win */}
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs font-semibold">
								<span className="text-indigo-400">Gana {match.teamHome}</span>
								<span className="text-slate-300">65%</span>
							</div>
							<div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
								<div
									className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
									style={{ width: "65%" }}
								/>
							</div>
						</div>

						{/* Option 2: Draw */}
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs font-semibold">
								<span className="text-amber-400">Empate</span>
								<span className="text-slate-300">20%</span>
							</div>
							<div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
								<div
									className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-1000"
									style={{ width: "20%" }}
								/>
							</div>
						</div>

						{/* Option 3: Away Win */}
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs font-semibold">
								<span className="text-sky-400">Gana {match.teamAway}</span>
								<span className="text-slate-300">15%</span>
							</div>
							<div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
								<div
									className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-1000"
									style={{ width: "15%" }}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
