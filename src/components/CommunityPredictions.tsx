"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { OtherPrediction } from "@/app/api/matches/[id]/predictions/route";

interface CommunityPredictionsProps {
	predictions: OtherPrediction[];
}

function PointsBadge({ points }: { points: number | null }) {
	if (points === 3) {
		return (
			<span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/25">
				+3
			</span>
		);
	}
	if (points === 1) {
		return (
			<span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-700/50 text-slate-300 border border-slate-600/40">
				+1
			</span>
		);
	}
	return (
		<span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-900/60 text-slate-500 border border-slate-800">
			+0
		</span>
	);
}

function Avatar({
	displayName,
	photoURL,
}: {
	displayName: string;
	photoURL?: string;
}) {
	if (photoURL) {
		return (
			<img
				src={photoURL}
				alt={displayName}
				className="w-9 h-9 rounded-full object-cover border border-slate-700/60 shrink-0"
			/>
		);
	}
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
	return (
		<div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
			<span className="text-xs font-black text-slate-300">{initials}</span>
		</div>
	);
}

export default function CommunityPredictions({
	predictions,
}: CommunityPredictionsProps) {
	const { t } = useLanguage();

	if (predictions.length === 0) return null;

	return (
		<div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
			<div>
				<h4 className="text-sm font-black text-white uppercase tracking-wide">
					{t("community_title")}
				</h4>
				<p className="text-xs text-slate-400 mt-0.5">
					{t("community_subtitle", { count: predictions.length })}
				</p>
			</div>

			<div className="space-y-2">
				{predictions.map((p) => (
					<div
						key={p.userId}
						className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl px-4 py-3"
					>
						<Avatar displayName={p.displayName} photoURL={p.photoURL} />

						<span className="flex-1 text-sm font-bold text-slate-200 truncate">
							{p.displayName}
						</span>

						<span className="font-mono text-sm font-black text-white shrink-0">
							{p.predictHome ?? "-"} – {p.predictAway ?? "-"}
						</span>

						<PointsBadge points={p.pointsEarned} />
					</div>
				))}
			</div>
		</div>
	);
}
