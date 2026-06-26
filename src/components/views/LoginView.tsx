"use client";

import React, { useState } from "react";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	updateProfile,
	OAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider("microsoft.com");

export default function LoginView() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useLanguage();

	const ensureUserDoc = async (
		uid: string,
		displayName: string,
		email: string,
		photoURL?: string,
	) => {
		await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ uid, displayName, email, photoURL }),
		});
	};

	const getErrorMessage = (err: unknown): string => {
		if (typeof err === "object" && err !== null && "code" in err) {
			const code = (err as { code: string }).code;
			const map: Record<string, string> = {
				"auth/user-not-found": t("login_errUserNotFound"),
				"auth/wrong-password": t("login_errWrongPassword"),
				"auth/email-already-in-use": t("login_errEmailInUse"),
				"auth/weak-password": t("login_errWeakPassword"),
				"auth/invalid-email": t("login_errInvalidEmail"),
				"auth/popup-closed-by-user": t("login_errPopupClosed"),
				"auth/invalid-credential": t("login_errInvalidCredential"),
			};
			return map[code] ?? t("login_errGeneric");
		}
		return t("login_errGeneric");
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			if (isSignUp) {
				const { user } = await createUserWithEmailAndPassword(
					auth,
					email,
					password,
				);
				await updateProfile(user, { displayName });
				await ensureUserDoc(user.uid, displayName, email);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch (err: unknown) {
			setError(getErrorMessage(err));
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setError("");
		setIsLoading(true);
		try {
			const { user } = await signInWithPopup(auth, googleProvider);
			await ensureUserDoc(
				user.uid,
				user.displayName ?? user.email?.split("@")[0] ?? t("nav_defaultUser"),
				user.email ?? "",
				user.photoURL ?? undefined,
			);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
			setIsLoading(false);
		}
	};

	const handleMicrosoftLogin = async () => {
		setError("");
		setIsLoading(true);

		const tenantId = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID;
		if (!tenantId) {
			setError(t("login_errMicrosoftTenantNotSet"));
			setIsLoading(false);
			return;
		}

		microsoftProvider.setCustomParameters({ tenant: tenantId });
		try {
			const { user } = await signInWithPopup(auth, microsoftProvider);
			await ensureUserDoc(
				user.uid,
				user.displayName ?? user.email?.split("@")[0] ?? t("nav_defaultUser"),
				user.email ?? "",
				user.photoURL ?? undefined,
			);
		} catch (err: unknown) {
			setError(getErrorMessage(err));
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
			<div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

			<div className="relative w-full max-w-md backdrop-blur-xl bg-slate-900/75 p-8 rounded-3xl border border-slate-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300">
				{/* Logo / Title */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-9 h-9 text-slate-950"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v3.375m9 0ZM9 18.75V10.5m-3.75 3h7.5M12 3a9 9 0 0 1 9 9m-18 0a9 9 0 0 1 9-9Z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
						{t("appTitle")}
					</h1>
					<p className="text-sm text-slate-400 mt-2">{t("login_subtitle")}</p>
				</div>

				{/* Tab Headers */}
				<div className="flex border-b border-slate-800 mb-6">
					<button
						type="button"
						className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${!isSignUp ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
						onClick={() => {
							setIsSignUp(false);
							setError("");
						}}
					>
						{t("login_tabLogin")}
					</button>
					<button
						type="button"
						className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${isSignUp ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
						onClick={() => {
							setIsSignUp(true);
							setError("");
						}}
					>
						{t("login_tabSignUp")}
					</button>
				</div>

				{error && (
					<div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<div>
							<label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
								{t("login_labelName")}
							</label>
							<input
								type="text"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder={t("login_placeholderName")}
								className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
								required
							/>
						</div>
					)}

					<div>
						<label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
							{t("login_labelEmail")}
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("login_placeholderEmail")}
							className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
							required
						/>
					</div>

					<div>
						<label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
							{t("login_labelPassword")}
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-sm"
							required
							minLength={6}
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold tracking-wide text-sm hover:from-amber-400 hover:to-yellow-500 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isLoading ? (
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
								<span>{t("login_btnLoading")}</span>
							</>
						) : (
							<span>
								{isSignUp ? t("login_btnSignUp") : t("login_btnSubmit")}
							</span>
						)}
					</button>
				</form>

				<div className="relative my-6 flex items-center justify-center">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-slate-800" />
					</div>
					<span className="relative px-3 text-xs uppercase tracking-wider text-slate-500 bg-slate-900">
						{t("login_orContinueWith")}
					</span>
				</div>

				<button
					type="button"
					onClick={handleGoogleLogin}
					disabled={isLoading}
					className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold active:scale-[0.98] transition-all duration-200"
				>
					<svg
						className="w-5 h-5 shrink-0"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g transform="matrix(1, 0, 0, 1, 0, 0)">
							<path
								d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.43C21.68,11.77 21.56,11.4 21.35,11.1z"
								fill="#4285F4"
							/>
							<path
								d="M12,20.58c2.59,0 4.77,-0.86 6.36,-2.33l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.06,0.98 -2.36,0 -4.36,-1.59 -5.07,-3.72H3.48v2.66c1.57,3.12 4.82,5.27 8.52,5.27z"
								fill="#34A853"
							/>
							<path
								d="M6.93,12.93c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V6.87H3.48c-0.6,1.2 -0.95,2.56 -0.95,3.99s0.35,2.79 0.95,3.99L6.93,12.93z"
								fill="#FBBC05"
							/>
							<path
								d="M12,5.16c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.77,2.27 14.59,1.42 12,1.42c-3.7,0 -6.95,2.15 -8.52,5.27l3.45,2.66c0.71,-2.13 2.71,-3.72 5.07,-3.72z"
								fill="#EA4335"
							/>
						</g>
					</svg>
					<span>{t("login_btnGoogle")}</span>
				</button>

				<button
					type="button"
					onClick={handleMicrosoftLogin}
					disabled={isLoading}
					className="w-full flex items-center justify-center gap-3 py-3.5 px-4 mt-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold active:scale-[0.98] transition-all duration-200"
				>
					<svg
						className="w-5 h-5 shrink-0"
						viewBox="0 0 23 23"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect x="1" y="1" width="10" height="10" fill="#F25022" />
						<rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
						<rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
						<rect x="12" y="12" width="10" height="10" fill="#FFB900" />
					</svg>
					<span>{t("login_btnMicrosoft")}</span>
				</button>
			</div>
		</div>
	);
}
