"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useProde } from "../../../context/ProdeContext";
import MatchDetailView from "../../../components/views/MatchDetailView";
import type { OtherPrediction } from "@/app/api/matches/[id]/predictions/route";

export default function MatchDetailPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const matchId = params.id as string;
	const fromUrl = searchParams.get("from")
		? decodeURIComponent(searchParams.get("from")!)
		: "/fixture";

	const {
		isLoggedIn,
		isAuthLoading,
		matches,
		teams,
		predictions,
		currentUser,
		handleSavePrediction,
	} = useProde();

	const [otherPredictions, setOtherPredictions] = useState<OtherPrediction[]>(
		[],
	);

	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) router.push("/login");
	}, [isLoggedIn, isAuthLoading, router]);

	const match = matches.find((m) => m.matchId === matchId);

	useEffect(() => {
		if (!match || match.status !== "FINISHED" || !currentUser) return;
		fetch(`/api/matches/${matchId}/predictions?uid=${currentUser.uid}`)
			.then((res) => res.json())
			.then((data: OtherPrediction[]) => setOtherPredictions(data))
			.catch(() => {});
	}, [match?.status, matchId, currentUser?.uid]);

	if (isAuthLoading || !isLoggedIn || !currentUser) return null;

	if (!match) {
		router.replace("/fixture");
		return null;
	}

	const prediction = predictions.find(
		(p) => p.matchId === matchId && p.uid === currentUser.uid,
	);

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<MatchDetailView
				match={match}
				teams={teams}
				prediction={prediction}
				otherPredictions={otherPredictions}
				onSavePrediction={handleSavePrediction}
				onBack={() => router.push(fromUrl)}
			/>
		</div>
	);
}
