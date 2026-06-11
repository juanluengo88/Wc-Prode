"use client";

import React, { useState, useEffect } from "react";
import { User, Group } from "../../lib/mockData";

interface LeaderboardViewProps {
	currentUser: User;
	users: User[];
	userGroups: Group[];
	onGroupChange: (groupId: string) => void;
}

export default function LeaderboardView({
	currentUser,
	users,
	userGroups,
	onGroupChange,
}: LeaderboardViewProps) {
	const [activeGroupId, setActiveGroupId] = useState<string>(
		userGroups[0]?.gId || "",
	);

	const handleSelectGroup = (groupId: string) => {
		setActiveGroupId(groupId);
		onGroupChange(groupId);
	};

	const rankedUsers = [...users]
		.sort((a, b) => b.totalPoints - a.totalPoints)
		.map((user, index) => ({
			...user,
			rank: index + 1,
		}));

	const currentUserRanked = rankedUsers.find((u) => u.id === currentUser.uid); // ignora el tipo xd
	const currentUserRank = currentUserRanked ? currentUserRanked.rank : "-";
	const top1 = rankedUsers.find((u) => u.rank === 1);
	const top2 = rankedUsers.find((u) => u.rank === 2);
	const top3 = rankedUsers.find((u) => u.rank === 3);
	const tableUsers = rankedUsers.filter((u) => u.rank > 3);

	return (
		<div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-16">
			{/* Navbar Title */}
			<header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-4 sm:px-8">
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-lg font-extrabold text-white">
							Tabla de Posiciones
						</h2>
						<p className="text-xs text-slate-400">
							Ranking competitivo por sesión
						</p>
					</div>
					<div className="bg-slate-800/50 border border-slate-700/50 py-1.5 px-3 rounded-full text-xs font-semibold self-start sm:self-auto">
						Tu Puesto en este grupo:{" "}
						<span className="text-amber-400 font-bold">#{currentUserRank}</span>
					</div>
				</div>
			</header>

			{/* Main Container */}
			<main className="max-w-4xl mx-auto px-4 py-8 sm:px-8 space-y-8">
				{/* 🗂️ SELECTOR DE SESIONES INTERACTIVO */}
				{userGroups.length > 0 && (
					<div className="space-y-2">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Seleccionar Grupo / Sesión
						</label>
						<div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/60 border border-slate-900 rounded-2xl">
							{userGroups.map((group) => {
								const isSelected = group.gId === activeGroupId;
								return (
									<button
										key={group.gId}
										type="button"
										onClick={() => handleSelectGroup(group.gId)}
										className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
											isSelected
												? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10 scale-[1.02]"
												: "bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
										}`}
									>
										{group.name}
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Si el grupo seleccionado no tiene usuarios cargados todavía */}
				{rankedUsers.length === 0 ? (
					<div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-900">
						<p className="text-slate-400 font-medium">
							No hay participantes registrados en esta sesión todavía.
						</p>
					</div>
				) : (
					<>
						{/* Podium Section */}
						<div className="relative pt-12 pb-6 px-4 rounded-3xl bg-gradient-to-b from-indigo-950/20 to-slate-900/40 border border-slate-850 flex items-end justify-center gap-2 sm:gap-6 min-h-[300px] overflow-hidden">
							<div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/5 to-transparent blur-xl pointer-events-none" />

							{/* 2nd Place */}
							{top2 && (
								<div className="flex-1 flex flex-col items-center max-w-[130px] z-10">
									<div className="relative mb-3">
										<div className="absolute -inset-0.5 rounded-full bg-slate-400 opacity-35 blur-sm" />
										{top2.photoURL ? (
											<img
												src={top2.photoURL}
												alt={top2.displayName}
												className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-400 object-cover shadow-lg"
											/>
										) : (
											<div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm">
												{top2.displayName.charAt(0)}
											</div>
										)}
										<span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center border border-slate-900 shadow">
											2
										</span>
									</div>
									<span className="text-xs font-bold text-slate-200 truncate w-full text-center">
										{top2.uid === currentUser.uid ? "Tú" : top2.displayName}
									</span>
									<span className="text-[11px] font-black text-slate-400 mt-0.5">
										{top2.totalPoints} pts
									</span>
									<div className="w-full bg-slate-900/80 border-t border-x border-slate-800 h-16 rounded-t-xl mt-3 flex items-center justify-center shadow-inner">
										<span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
											Plata
										</span>
									</div>
								</div>
							)}

							{/* 1st Place */}
							{top1 && (
								<div className="flex-1 flex flex-col items-center max-w-[150px] z-20">
									<span className="text-xl mb-1 animate-bounce">👑</span>
									<div className="relative mb-3">
										<div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 opacity-60 blur-md animate-pulse" />
										{top1.photoURL ? (
											<img
												src={top1.photoURL}
												alt={top1.displayName}
												className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500 object-cover shadow-2xl"
											/>
										) : (
											<div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500 bg-slate-800 flex items-center justify-center text-amber-400 font-extrabold text-lg">
												{top1.displayName.charAt(0)}
											</div>
										)}
										<span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center border border-slate-900 shadow">
											1
										</span>
									</div>
									<span className="text-sm font-black text-white truncate w-full text-center">
										{top1.uid === currentUser.uid ? "Tú" : top1.displayName}
									</span>
									<span className="text-xs font-black text-amber-400 mt-0.5">
										{top1.totalPoints} pts
									</span>
									<div className="w-full bg-slate-900 border-t border-x border-amber-500/20 h-24 rounded-t-2xl mt-3 flex items-center justify-center shadow-lg">
										<span className="text-xs uppercase font-black tracking-widest text-amber-400">
											Oro
										</span>
									</div>
								</div>
							)}

							{/* 3rd Place */}
							{top3 && (
								<div className="flex-1 flex flex-col items-center max-w-[130px] z-10">
									<div className="relative mb-3">
										<div className="absolute -inset-0.5 rounded-full bg-amber-700 opacity-30 blur-sm" />
										{top3.photoURL ? (
											<img
												src={top3.photoURL}
												alt={top3.displayName}
												className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-700 object-cover shadow-lg"
											/>
										) : (
											<div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-700 bg-slate-800 flex items-center justify-center text-amber-700 font-bold text-sm">
												{top3.displayName.charAt(0)}
											</div>
										)}
										<span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-700 text-slate-200 font-black text-xs flex items-center justify-center border border-slate-900 shadow">
											3
										</span>
									</div>
									<span className="text-xs font-bold text-slate-200 truncate w-full text-center">
										{top3.uid === currentUser.uid ? "Tú" : top3.displayName}
									</span>
									<span className="text-[11px] font-black text-slate-400 mt-0.5">
										{top3.totalPoints} pts
									</span>
									<div className="w-full bg-slate-900/80 border-t border-x border-slate-800 h-12 rounded-t-xl mt-3 flex items-center justify-center shadow-inner">
										<span className="text-[10px] uppercase font-black tracking-widest text-amber-700">
											Bronce
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Global Leaderboard Table */}
						<div className="overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-900">
							<div className="p-4 border-b border-slate-900 bg-slate-900/20">
								<h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
									Resto de Participantes
								</h3>
							</div>

							<div className="divide-y divide-slate-900/60 max-h-[400px] overflow-y-auto">
								{tableUsers.map((item) => {
									const isCurrentUser = item.uid === currentUser.uid;

									return (
										<div
											key={item.uid}
											className={`flex items-center justify-between p-4 transition-colors ${
												isCurrentUser
													? "bg-amber-500/10 border-l-4 border-amber-500/80 text-white font-bold"
													: "hover:bg-slate-900/20 text-slate-300"
											}`}
										>
											<div className="flex items-center gap-4">
												<span
													className={`w-6 text-center text-sm font-black ${
														isCurrentUser ? "text-amber-400" : "text-slate-500"
													}`}
												>
													{item.rank}º
												</span>

												{item.photoURL ? (
													<img
														src={item.photoURL}
														alt={item.displayName}
														className={`w-9 h-9 rounded-full object-cover border ${
															isCurrentUser
																? "border-amber-400"
																: "border-slate-800"
														}`}
													/>
												) : (
													<div className="w-9 h-9 rounded-full bg-slate-850 flex items-center justify-center text-xs text-slate-400 font-bold border border-slate-800">
														{item.displayName.charAt(0).toUpperCase()}
													</div>
												)}

												<div className="text-sm">
													<span className="block font-medium">
														{item.displayName}{" "}
														{isCurrentUser && (
															<span className="text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20 ml-1.5 uppercase font-bold">
																Tú
															</span>
														)}
													</span>
													<span className="text-[10px] text-slate-500 block truncate max-w-[120px] sm:max-w-none">
														{item.email}
													</span>
												</div>
											</div>

											<div className="text-right">
												<span
													className={`text-base font-black ${
														isCurrentUser ? "text-amber-400" : "text-slate-200"
													}`}
												>
													{item.totalPoints} pts
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
