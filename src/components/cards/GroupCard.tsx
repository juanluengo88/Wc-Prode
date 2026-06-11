"use client";

import React, { useState, useEffect } from "react";
import { GroupItem } from "@/hooks/useAdminView";

// 🌟 1. TRAEMOS LA INTERFAZ DIRECTAMENTE AL COMPONENTE
// Así evitamos importar NADA desde el backend/userService
export interface UserDoc {
	id: string;
	uid: string;
	displayName: string;
	email: string;
	totalPoints: number;
	photoURL?: string;
	admin?: boolean;
	groupId?: string | null;
}

interface GroupCardProps {
	group: GroupItem;
	onDeleteGroup?: (groupId: string) => Promise<void>;
}

export default function GroupCard({ group, onDeleteGroup }: GroupCardProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [groupUsers, setGroupUsers] = useState<UserDoc[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);

	useEffect(() => {
		const fetchUsers = async () => {
			if (
				isOpen &&
				group.members &&
				group.members.length > 0 &&
				groupUsers.length === 0
			) {
				setIsLoadingUsers(true);
				try {
					// 🌟 2. CAMBIO VITAL: Reemplazamos getUserById por un llamado HTTP a tu API
					const userPromises = group.members.map(async (id: any) => {
						const res = await fetch(`/api/users/${id}`);
						if (res.ok) {
							return await res.json();
						}
						return null;
					});

					const usersFetched = await Promise.all(userPromises);

					setGroupUsers(usersFetched.filter((u) => u !== null) as UserDoc[]);
				} catch (error) {
					console.error("Error al cargar los usuarios del grupo:", error);
				} finally {
					setIsLoadingUsers(false);
				}
			}
		};

		fetchUsers();
	}, [isOpen, group.members, groupUsers.length]);

	const handleCopyLink = async (e: React.MouseEvent) => {
		e.stopPropagation();

		const inviteLink = `${window.location.origin}/join/${group.id}`;

		try {
			await navigator.clipboard.writeText(inviteLink);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Error al copiar enlace:", err);
		}
	};

	const handleDeleteGroup = async (e: React.MouseEvent) => {
		e.stopPropagation();

		// Confirmación antes de borrar
		if (
			!confirm(
				`¿Estás seguro de que deseas borrar el grupo "${group.name}"? Esta acción no se puede deshacer.`,
			)
		) {
			return;
		}

		if (!onDeleteGroup) {
			console.error("onDeleteGroup no está disponible");
			return;
		}

		setIsDeleting(true);
		try {
			await onDeleteGroup(group.id);
		} catch (err) {
			console.error("Error al borrar grupo:", err);
			alert("Error al borrar el grupo. Intenta de nuevo.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="bg-slate-950/40 border border-slate-900 rounded-2xl transition-all overflow-hidden">
			{/* Header de la Card */}
			<div
				onClick={() => setIsOpen(!isOpen)}
				className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-950/80 transition-colors gap-3 select-none"
			>
				<div className="flex flex-col min-w-0">
					<span className="font-extrabold text-slate-200 text-xs sm:text-sm truncate">
						{group.name}
					</span>
					<span className="text-[10px] text-slate-500 truncate mt-0.5">
						{group.description || "Sin descripción"}
					</span>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={handleCopyLink}
						className={`py-1 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
							copied
								? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
								: "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700"
						}`}
					>
						{copied ? <span>¡Copiado!</span> : <span>Invitar</span>}
					</button>

					<button
						type="button"
						onClick={handleDeleteGroup}
						disabled={isDeleting}
						className="text-xs text-slate-400 hover:text-red-400 transition-colors py-1 px-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 disabled:opacity-50"
					>
						{isDeleting ? "Borrando..." : "Borrar"}
					</button>

					{/* Flecha Dropdown */}
					<div
						className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-400" : ""}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2.5}
							stroke="currentColor"
							className="w-3.5 h-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m19.5 8.25-7.5 7.5-7.5-7.5"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Desplegable de Usuarios Miembros */}
			{isOpen && (
				<div className="border-t border-slate-900/60 bg-slate-950/20 px-3.5 py-3 space-y-2 max-h-[180px] overflow-y-auto animate-fadeIn">
					<span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
						Participantes del Grupo ({group.members?.length || 0})
					</span>

					{!group.members || group.members.length === 0 ? (
						<div className="text-[10px] text-slate-600 italic py-2">
							Aún no se han unido participantes a este grupo.
						</div>
					) : isLoadingUsers ? (
						<div className="flex items-center gap-2 py-3 text-slate-500 text-[10px] uppercase font-bold animate-pulse">
							<svg
								className="animate-spin h-3.5 w-3.5 text-amber-500"
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
							Cargando participantes...
						</div>
					) : (
						<div className="space-y-1.5">
							{groupUsers.map((member, index) => {
								const name = member.displayName || "Usuario";
								const photo = member.photoURL || "";
								const points = member.totalPoints ?? 0;
								const inicial = name.charAt(0).toUpperCase();

								const uniqueKey = `${member.uid || member.id || "usr"}-${index}`;

								return (
									<div
										key={uniqueKey}
										className="flex items-center justify-between py-1 border-b border-slate-900/40 last:border-0 text-[11px]"
									>
										<div className="flex items-center gap-2 truncate">
											{photo ? (
												<img
													src={photo}
													alt={name}
													className="w-5 h-5 rounded-full object-cover border border-slate-800"
												/>
											) : (
												<div className="w-5 h-5 rounded-full bg-slate-800 text-[9px] text-slate-400 font-bold flex items-center justify-center uppercase">
													{inicial}
												</div>
											)}
											<span className="font-semibold text-slate-300 truncate">
												{name}
											</span>
										</div>
										<span className="font-mono font-bold text-amber-400 shrink-0">
											{points} pts
										</span>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
