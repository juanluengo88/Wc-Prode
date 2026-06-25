"use client";

import React, { useState, useRef } from "react";
import { User } from "../../lib/mockData";
import { useLanguage } from "../../context/LanguageContext";

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
	const { t } = useLanguage();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setErrorMessage("");
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setErrorMessage(t("profile_errInvalidFile"));
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			setErrorMessage(t("profile_errFileTooLarge"));
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
						<h2 className="text-lg font-extrabold text-white">{t("profile_title")}</h2>
						<p className="text-xs text-slate-400">{t("profile_subtitle")}</p>
					</div>
					<button
						onClick={onLogout}
						className="text-xs text-red-400 hover:text-red-300 font-bold bg-red-500/10 border border-red-500/25 py-1.5 px-3 rounded-xl transition-colors"
					>
						{t("profile_btnLogout")}
					</button>
				</div>
			</header>

			<main className="max-w-xl mx-auto px-4 py-8 space-y-6">
				{/* Stats Card */}
				<div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-850 flex items-center justify-between gap-4">
					<div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-[50px] pointer-events-none" />

					<div className="space-y-1">
						<span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
							{t("profile_competitiveSummary")}
						</span>
						<span className="text-slate-200 block text-sm font-semibold truncate max-w-[180px] sm:max-w-none">
							{displayName || t("profile_defaultUser")}
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
								{t("profile_points")}
							</span>
						</div>
						<div className="text-center px-3">
							<span className="block text-xl font-black text-slate-350">
								#{user.rank ?? "-"}
							</span>
							<span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
								{t("profile_rank")}
							</span>
						</div>
					</div>
				</div>

				{/* Edit Form */}
				<div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl space-y-8">
					{/* Avatar Upload */}
					<div className="flex flex-col items-center gap-5">
						<div className="relative group">
							<div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 opacity-20 blur-sm group-hover:opacity-45 transition-opacity" />

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
										{t("profile_uploadPhoto")}
									</span>
								</div>
							</div>
						</div>

						<div className="text-center">
							<span className="text-xs font-bold text-slate-350 block">
								{t("profile_photoSection")}
							</span>
							<p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
								{t("profile_photoHelper")}
							</p>

							<button
								type="button"
								onClick={triggerFileSelect}
								className="mt-3 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-350 active:scale-[0.98] transition-all uppercase tracking-wider"
							>
								{t("profile_btnBrowse")}
							</button>

							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>
						</div>

						{errorMessage && (
							<div className="w-full text-center text-xs text-red-400 font-semibold p-2.5 rounded-xl bg-red-500/10 border border-red-500/15">
								{errorMessage}
							</div>
						)}
					</div>

					<form onSubmit={handleSave} className="space-y-5">
						<div>
							<label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
								{t("profile_labelName")}
							</label>
							<input
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder={t("profile_placeholderName")}
								maxLength={20}
								className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
								{t("profile_labelEmail")}
							</label>
							<input
								type="email"
								value={user.email}
								disabled
								className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-900 text-slate-500 font-medium text-sm cursor-not-allowed"
							/>
						</div>

						{showSuccess && (
							<div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold text-center animate-pulse">
								{t("profile_successMessage")}
							</div>
						)}

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
									<span>{t("profile_btnSaving")}</span>
								</>
							) : (
								<span>{t("profile_btnSave")}</span>
							)}
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}
