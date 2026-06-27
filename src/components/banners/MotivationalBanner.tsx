"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SLIDE_INTERVAL = 8000;
const FADE_DURATION = 350;

export default function MotivanationalBanner() {
	const { t } = useLanguage();
	const router = useRouter();
	const [active, setActive] = useState(0);
	const [visible, setVisible] = useState(true);

	const slides = [
		{
			badge: t("banner_badge"),
			title: t("banner_title"),
			content: (
				<p className="text-sm text-slate-300 max-w-xl">
					{t("banner_descPart1")}{" "}
					<strong className="text-white">{t("banner_descBold")}</strong>{" "}
					{t("banner_descPart2")}{" "}
					<span className="text-amber-400 font-semibold">
						{t("banner_exactPoints")}
					</span>{" "}
					{t("banner_descPart3")}{" "}
					<span className="text-amber-400 font-semibold">
						{t("banner_partialPoints")}
					</span>
					{t("banner_descPart4")}
				</p>
			),
			side: (
				<div className="shrink-0 flex items-center justify-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shadow-inner">
					<div className="text-center px-4 border-r border-slate-800">
						<span className="block text-2xl font-black text-amber-400">
							3 pts
						</span>
						<span className="text-[10px] text-slate-400 uppercase tracking-wider">
							{t("banner_exactLabel")}
						</span>
					</div>
					<div className="text-center px-4">
						<span className="block text-2xl font-black text-slate-300">
							1 pt
						</span>
						<span className="text-[10px] text-slate-400 uppercase tracking-wider">
							{t("banner_partialLabel")}
						</span>
					</div>
				</div>
			),
		},
		{
			badge: t("banner_standings_badge"),
			title: t("banner_standings_title"),
			content: (
				<p className="text-sm text-slate-300 max-w-xl">
					{t("banner_standings_desc")}
				</p>
			),
			side: (
				<button
					onClick={() => router.push("/standings")}
					className="shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
				>
					{t("banner_standings_btn")}
				</button>
			),
		},
	];

	const goTo = (i: number) => {
		setVisible(false);
		setTimeout(() => {
			setActive(i);
			setVisible(true);
		}, FADE_DURATION);
	};

	useEffect(() => {
		const timer = setInterval(() => {
			goTo((active + 1) % slides.length);
		}, SLIDE_INTERVAL);
		return () => clearInterval(timer);
	}, [active, slides.length]);

	return (
		<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8">
			<div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

			{/* All slides rendered in the same grid cell so the container height = tallest slide */}
			<div style={{ display: "grid" }}>
				{slides.map((slide, i) => (
					<div
						key={i}
						className="flex flex-col md:flex-row items-center justify-between gap-6 transition-opacity duration-500"
						style={{
							gridArea: "1 / 1",
							opacity: i === active && visible ? 1 : 0,
							pointerEvents: i === active ? "auto" : "none",
						}}
					>
						<div className="space-y-2 text-center md:text-left">
							<span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
								{slide.badge}
							</span>
							<h3 className="text-2xl font-black text-white mt-3">{slide.title}</h3>
							{slide.content}
						</div>
						{slide.side}
					</div>
				))}
			</div>

			{/* Dots */}
			<div className="flex justify-center gap-2 mt-6">
				{slides.map((_, i) => (
					<button
						key={i}
						onClick={() => goTo(i)}
						className={`h-2 rounded-full transition-all duration-300 ${
							i === active
								? "bg-amber-400 w-5"
								: "bg-slate-600 hover:bg-slate-500 w-2"
						}`}
					/>
				))}
			</div>
		</div>
	);
}
