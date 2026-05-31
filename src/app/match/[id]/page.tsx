"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProde } from "../../../context/ProdeContext";
import MatchDetailView from "../../../components/views/MatchDetailView";

export default function MatchDetailPage() {
	const router = useRouter();
	const params = useParams();
	const matchId = params.id as string;

	const {
		isLoggedIn,
		isAuthLoading,
		matches,
		teams,
		predictions,
		currentUser,
		handleSavePrediction,
	} = useProde();

	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) router.push("/login");
	}, [isLoggedIn, isAuthLoading, router]);

	if (isAuthLoading || !isLoggedIn || !currentUser) return null;

	const match = matches.find((m) => m.matchId === matchId);
	const prediction = predictions.find(
		(p) => p.matchId === matchId && p.uid === currentUser.uid,
	);

	if (!match) {
		router.replace("/fixture");
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<MatchDetailView
				match={match}
				teams={teams}
				prediction={prediction}
				onSavePrediction={handleSavePrediction}
				onBack={() => router.back()}
			/>
		</div>
	);
}
