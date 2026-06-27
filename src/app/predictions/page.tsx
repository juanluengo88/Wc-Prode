"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProde } from "../../context/ProdeContext";
import TopNavbar from "../../components/navigation/TopNavbar";
import BottomNav from "../../components/navigation/BottomNav";
import MyPredictionsView from "../../components/views/MyPredictionsView";

function PredictionsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isLoggedIn, isAuthLoading, currentUser, matches, predictions } =
		useProde();

	const tab = searchParams.get("tab") === "FINISHED" ? "FINISHED" : "ACTIVE";

	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) {
			router.push("/login");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	if (isAuthLoading || !isLoggedIn || !currentUser) return null;

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<TopNavbar />
			<div className="flex-1 flex flex-col">
				<MyPredictionsView
					matches={matches}
					predictions={predictions.filter((p) => p.uid === currentUser.uid)}
					onSelectMatch={(matchId) => router.push(`/match/${matchId}`)}
					initialTab={tab}
				/>
			</div>
			<BottomNav />
		</div>
	);
}

export default function PredictionsPage() {
	return (
		<Suspense>
			<PredictionsContent />
		</Suspense>
	);
}
