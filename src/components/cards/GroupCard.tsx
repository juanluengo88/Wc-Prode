"use client";

import React, { useState, useEffect } from "react";
import { GroupItem } from "@/hooks/useAdminView";

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

	// Add-users modal state
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [availableUsers, setAvailableUsers] = useState<UserDoc[]>([]);
	const [loadingAvailable, setLoadingAvailable] = useState(false);
	const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
	const [isAdding, setIsAdding] = useState(false);
	const [userSearch, setUserSearch] = useState("");

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

	useEffect(() => {
		if (!isAddModalOpen) return;

		const fetchAvailableUsers = async () => {
			setLoadingAvailable(true);
			try {
				const res = await fetch("/api/users");
				if (res.ok) {
					const json = await res.json();
					const allUsers: UserDoc[] = json.users || json;
					const memberIds = new Set(
						(group.members as any[])?.map((m) => String(m)) ?? [],
					);
					setAvailableUsers(
						allUsers.filter(
							(u) => !memberIds.has(u.uid) && !memberIds.has(u.id),
						),
					);
				}
			} catch (err) {
				console.error("Error al cargar usuarios disponibles:", err);
			} finally {
				setLoadingAvailable(false);
			}
		};

		fetchAvailableUsers();
	}, [isAddModalOpen, group.members]);

	const handleCopyLink = async (e: React.MouseEvent) => {
		e.stopPropagation();

		const inviteLink = `${window.location.origin}/invite/group/${group.id}`;

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

	const handleOpenAddModal = (e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUserIds(new Set());
		setUserSearch("");
		setIsAddModalOpen(true);
	};

	const handleToggleUser = (userId: string) => {
		setSelectedUserIds((prev) => {
			const next = new Set(prev);
			if (next.has(userId)) next.delete(userId);
			else next.add(userId);
			return next;
		});
	};

	const handleBulkAdd = async () => {
		if (selectedUserIds.size === 0) return;
		setIsAdding(true);
		try {
			const res = await fetch(`/api/groups/${group.id}/members`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userIds: Array.from(selectedUserIds) }),
			});

			if (!res.ok) throw new Error("Error en la respuesta del servidor");

			const addedUsers = availableUsers.filter(
				(u) => selectedUserIds.has(u.uid) || selectedUserIds.has(u.id),
			);
			setGroupUsers((prev) => [...prev, ...addedUsers]);
			setAvailableUsers((prev) =>
				prev.filter(
					(u) => !selectedUserIds.has(u.uid) && !selectedUserIds.has(u.id),
				),
			);
			setIsAddModalOpen(false);
			setSelectedUserIds(new Set());
		} catch (err) {
			console.error("Error al agregar usuarios:", err);
		} finally {
			setIsAdding(false);
		}
	};

	const filteredAvailable = availableUsers.filter(
		(u) =>
			u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
			u.email?.toLowerCase().includes(userSearch.toLowerCase()),
	);

	return (
		<>
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
							onClick={handleOpenAddModal}
							className="py-1 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700"
						>
							Agregar Usuario
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

			{/* Modal: Agregar Usuarios */}
			{isAddModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
					onClick={() => setIsAddModalOpen(false)}
				>
					<div
						className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm flex flex-col max-h-[80vh] shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="px-4 pt-4 pb-3 border-b border-slate-800 flex items-center justify-between shrink-0">
							<div>
								<h3 className="font-extrabold text-slate-100 text-sm">
									Agregar Usuarios
								</h3>
								<p className="text-[10px] text-slate-500 mt-0.5 truncate">
									{group.name}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsAddModalOpen(false)}
								className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Search */}
						<div className="px-4 py-2.5 border-b border-slate-800/60 shrink-0">
							<input
								type="text"
								placeholder="Buscar usuario..."
								value={userSearch}
								onChange={(e) => setUserSearch(e.target.value)}
								className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
							/>
						</div>

						{/* User list */}
						<div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 min-h-0">
							{loadingAvailable ? (
								<div className="flex items-center gap-2 py-6 justify-center text-slate-500 text-[10px] uppercase font-bold animate-pulse">
									<svg className="animate-spin h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									Cargando usuarios...
								</div>
							) : filteredAvailable.length === 0 ? (
								<p className="text-center text-[11px] text-slate-600 italic py-6">
									{availableUsers.length === 0
										? "Todos los usuarios ya están en el grupo."
										: "Sin resultados para tu búsqueda."}
								</p>
							) : (
								filteredAvailable.map((user) => {
									const uid = user.uid || user.id;
									const isSelected = selectedUserIds.has(uid);
									const name = user.displayName || "Usuario";
									const inicial = name.charAt(0).toUpperCase();

									return (
										<button
											key={uid}
											type="button"
											onClick={() => handleToggleUser(uid)}
											className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
												isSelected
													? "bg-amber-500/10 border-amber-500/30"
													: "bg-slate-800/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
											}`}
										>
											{/* Avatar */}
											{user.photoURL ? (
												<img src={user.photoURL} alt={name} className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0" />
											) : (
												<div className="w-7 h-7 rounded-full bg-slate-700 text-[10px] text-slate-300 font-bold flex items-center justify-center uppercase shrink-0">
													{inicial}
												</div>
											)}

											{/* Info */}
											<div className="flex-1 min-w-0">
												<p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
												<p className="text-[10px] text-slate-500 truncate">{user.email}</p>
											</div>

											{/* Checkbox */}
											<div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
												isSelected ? "bg-amber-500 border-amber-500" : "border-slate-600"
											}`}>
												{isSelected && (
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-slate-900">
														<path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
													</svg>
												)}
											</div>
										</button>
									);
								})
							)}
						</div>

						{/* Footer */}
						<div className="px-4 pb-4 pt-3 border-t border-slate-800 shrink-0 flex items-center justify-between gap-3">
							<span className="text-[10px] text-slate-500">
								{selectedUserIds.size > 0
									? `${selectedUserIds.size} seleccionado${selectedUserIds.size > 1 ? "s" : ""}`
									: "Ninguno seleccionado"}
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setIsAddModalOpen(false)}
									className="py-1.5 px-3 rounded-lg border border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={handleBulkAdd}
									disabled={selectedUserIds.size === 0 || isAdding}
									className="py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									{isAdding ? "Agregando..." : "Agregar"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
