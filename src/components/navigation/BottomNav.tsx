"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
	const pathname = usePathname();

	// Helper to determine active state styling
	const isActive = (path: string) => pathname === path;

	return (
		<nav className="sticky bottom-0 z-50 backdrop-blur-lg bg-slate-900/85 border-t border-slate-850 py-2.5 px-4 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.4)]">
			{/* Option 1: Fixture */}
			<Link
				href="/fixture"
				className={`flex flex-col items-center gap-1 group transition-all ${
					isActive("/fixture")
						? "text-amber-400 scale-105"
						: "text-slate-500 hover:text-slate-350"
				}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="w-5 h-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
					/>
				</svg>
				<span className="text-[9px] font-bold uppercase tracking-wider">
					Fixture
				</span>
			</Link>

			{/* Option 2: My Predictions */}
			<Link
				href="/predictions"
				className={`flex flex-col items-center gap-1 group transition-all ${
					isActive("/predictions")
						? "text-amber-400 scale-105"
						: "text-slate-500 hover:text-slate-350"
				}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="w-5 h-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.793 1.976 1.817M12 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v.032m-8.156 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-10.5Z"
					/>
				</svg>
				<span className="text-[9px] font-bold uppercase tracking-wider">
					Mis Pronósticos
				</span>
			</Link>

			{/* Option 3: Leaderboard */}
			<Link
				href="/leaderboard"
				className={`flex flex-col items-center gap-1 group transition-all ${
					isActive("/leaderboard")
						? "text-amber-400 scale-105"
						: "text-slate-500 hover:text-slate-350"
				}`}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="w-5 h-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94-3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
					/>
				</svg>
				<span className="text-[9px] font-bold uppercase tracking-wider">
					Posiciones
				</span>
			</Link>
		</nav>
	);
}
