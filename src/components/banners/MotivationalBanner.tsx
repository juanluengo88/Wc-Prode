"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function MotivanationalBanner() {
	const { t } = useLanguage();

	return (
		<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
			<div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />
			<div className="space-y-2 text-center md:text-left">
				<span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
					{t("banner_badge")}
				</span>
				<h3 className="text-2xl font-black text-white mt-3">
					{t("banner_title")}
				</h3>
				<p className="text-sm text-slate-300 max-w-xl">
					{t("banner_descPart1")}{" "}
					<strong className="text-white">{t("banner_descBold")}</strong>{" "}
					{t("banner_descPart2")}{" "}
					<span className="text-amber-400 font-semibold">{t("banner_exactPoints")}</span>{" "}
					{t("banner_descPart3")}{" "}
					<span className="text-amber-400 font-semibold">{t("banner_partialPoints")}</span>
					{t("banner_descPart4")}
				</p>
			</div>
			<div className="shrink-0 flex items-center justify-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shadow-inner">
				<div className="text-center px-4 border-r border-slate-800">
					<span className="block text-2xl font-black text-amber-400">3 pts</span>
					<span className="text-[10px] text-slate-400 uppercase tracking-wider">
						{t("banner_exactLabel")}
					</span>
				</div>
				<div className="text-center px-4">
					<span className="block text-2xl font-black text-slate-300">1 pt</span>
					<span className="text-[10px] text-slate-400 uppercase tracking-wider">
						{t("banner_partialLabel")}
					</span>
				</div>
			</div>
		</div>
	);
}
