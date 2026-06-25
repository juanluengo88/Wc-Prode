"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProde } from "../../context/ProdeContext";
import TopNavbar from "../../components/navigation/TopNavbar";
import BottomNav from "../../components/navigation/BottomNav";
import StandingsView from "../../components/views/StandingsView";
import type { StandingsData } from "@/types/standings";

export default function StandingsPage() {
	const router = useRouter();
	const { isLoggedIn, isAuthLoading } = useProde();
	const [data, setData] = useState<StandingsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) {
			router.push("/login");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	useEffect(() => {
		if (!isLoggedIn) return;
		fetch("/api/standings")
			.then((res) => {
				if (!res.ok) throw new Error("No se pudieron cargar las posiciones");
				return res.json();
			})
			.then((d: StandingsData) => setData(d))
			.catch((err: Error) => setError(err.message))
			.finally(() => setIsLoading(false));
	}, [isLoggedIn]);

	if (isAuthLoading || !isLoggedIn) return null;

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<TopNavbar />
			<div className="flex-1">
				<div className="max-w-5xl mx-auto px-4 pt-4 pb-28">
					<StandingsView data={data} isLoading={isLoading} error={error} />
				</div>
			</div>
			<BottomNav />
		</div>
	);
}
