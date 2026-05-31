"use client";

import React, { useState, useRef } from "react";
import { User } from "../../lib/mockData";

interface ProfileViewProps {
	user: User;
	onUpdateProfile: (displayName: string, photoURL: string) => Promise<void>;
	onLogout: () => void;
}

export default function ProfileView({
	user,
	onUpdateProfile,
	onLogout,
}: ProfileViewProps) {
	const [displayName, setDisplayName] = useState(user.displayName);
	const [photoURL, setPhotoURL] = useState(user.photoURL ?? "");
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle local image file loading (convert to base64 Data URL)
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setErrorMessage("");
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setErrorMessage("Por favor, selecciona únicamente archivos de imagen.");
			return;
		}

		// Validate size (limit to 2MB for browser base64 storage efficiency)
		if (file.size > 2 * 1024 * 1024) {
			setErrorMessage(
				"La imagen es demasiado grande. El límite recomendado es de 2MB.",
			);
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				setPhotoURL(reader.result);
			}
		};
		reader.readAsDataURL(file);
	};

	const triggerFileSelect = () => {
		fileInputRef.current?.click();
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!displayName.trim()) return;

		setIsSaving(true);
		try {
			await onUpdateProfile(displayName, photoURL);
			setIsSaving(false);
			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2500);
		} catch {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-16">
			{/* Sub Header */}
			<header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-880 px-4 py-4 sm:px-8">
				<div className="max-w-xl mx-auto flex items-center justify-between">
					<div>
						<h2 className="text-lg font-extrabold text-white">Mi Perfil</h2>
						<p className="text-xs text-slate-400">
							Edita tus datos de participante
						</p>
					</div>
					<button
						onClick={onLogout}
						className="text-xs text-red-400 hover:text-red-300 font-bold bg-red-500/10 border border-red-500/25 py-1.5 px-3 rounded-xl transition-colors"
					>
						Cerrar Sesión
					</button>
				</div>
			</header>

			{/* Profile settings card */}
			<main className="max-w-xl mx-auto px-4 py-8 space-y-6">
				{/* Statistics & Rank Card */}
				<div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-850 flex items-center justify-between gap-4">
					<div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-[50px] pointer-events-none" />

					<div className="space-y-1">
						<span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
							Resumen Competitivo
						</span>
						<span className="text-slate-200 block text-sm font-semibold truncate max-w-[180px] sm:max-w-none">
							{displayName || "Usuario"}
						</span>
						<span className="text-xs text-slate-500 font-semibold">
							{user.email}
						</span>
					</div>

					<div className="flex gap-4 shrink-0 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 shadow-inner">
						<div className="text-center px-3 border-r border-slate-800">
							<span className="block text-xl font-black text-amber-400">
								{user.totalPoints}
							</span>
							<span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
								Puntos
							</span>
						</div>
						<div className="text-center px-3">
							<span className="block text-xl font-black text-slate-350">
								#{user.rank ?? "-"}
							</span>
							<span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
								Puesto
							</span>
						</div>
					</div>
				</div>

				{/* Edit Form */}
				<div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl space-y-8">
					{/* Avatar Upload Segment */}
					<div className="flex flex-col items-center gap-5">
						<div className="relative group">
							{/* Outer glow aura */}
							<div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 opacity-20 blur-sm group-hover:opacity-45 transition-opacity" />

							{/* Profile Image container */}
							<div
								onClick={triggerFileSelect}
								className="relative w-28 h-28 rounded-full border-3 border-amber-500 overflow-hidden cursor-pointer shadow-2xl group active:scale-[0.98] transition-transform"
							>
								{photoURL ? (
									<img
										src={photoURL}
										alt={displayName}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-extrabold text-4xl uppercase">
										{displayName.charAt(0)}
									</div>
								)}

								{/* Visual Camera Hover Overlay */}
								<div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={2}
										stroke="currentColor"
										className="w-6 h-6 text-amber-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
										/>
									</svg>
									<span className="text-[9px] uppercase font-black text-slate-200 tracking-wider">
										Subir Foto
									</span>
								</div>
							</div>
						</div>

						{/* Sub text descriptor */}
						<div className="text-center">
							<span className="text-xs font-bold text-slate-350 block">
								Foto de Perfil
							</span>
							<p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
								Pulsa sobre el círculo o el botón inferior para cargar una
								imagen desde tu dispositivo.
							</p>

							<button
								type="button"
								onClick={triggerFileSelect}
								className="mt-3 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-350 active:scale-[0.98] transition-all uppercase tracking-wider"
							>
								Buscar Archivo
							</button>

							{/* Hidden Native File Input */}
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>
						</div>

						{/* Local file validation errors */}
						{errorMessage && (
							<div className="w-full text-center text-xs text-red-400 font-semibold p-2.5 rounded-xl bg-red-500/10 border border-red-500/15">
								{errorMessage}
							</div>
						)}
					</div>

					{/* Form details */}
					<form onSubmit={handleSave} className="space-y-5">
						{/* Input username */}
						<div>
							<label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
								Nombre de Participante
							</label>
							<input
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Ingresa tu nombre"
								maxLength={20}
								className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
								required
							/>
						</div>

						{/* Read-only email */}
						<div>
							<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
								Correo Electrónico (No editable)
							</label>
							<input
								type="email"
								value={user.email}
								disabled
								className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-900 text-slate-500 font-medium text-sm cursor-not-allowed"
							/>
						</div>

						{/* Success message banner */}
						{showSuccess && (
							<div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold text-center animate-pulse">
								¡Perfil actualizado exitosamente!
							</div>
						)}

						{/* Actions button */}
						<button
							type="submit"
							disabled={isSaving || !displayName.trim()}
							className="w-full py-3.5 px-4 mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-sm tracking-wide hover:from-amber-400 hover:to-yellow-500 active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
									<span>Guardando cambios...</span>
								</>
							) : (
								<span>Guardar Cambios</span>
							)}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}
