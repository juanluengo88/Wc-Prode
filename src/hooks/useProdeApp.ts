"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Match, Prediction, User } from "@/lib/mockData";
import { Team } from "@/lib/footballDataApi";

export function useProdeApp() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"FIXTURE" | "PREDICTIONS" | "LEADERBOARD" | "PROFILE"
	>("FIXTURE");
	const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

	const [matches, setMatches] = useState<Match[]>([]);
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);

	const fetchAppData = useCallback(async (uid: string) => {
		const [matchesRes, predictionsRes, usersRes, teamsRes] = await Promise.all([
			fetch("/api/matches"),
			fetch(`/api/predictions?uid=${uid}`),
			fetch("/api/users"),
			fetch("/api/teams"),
		]);
		const [matchesData, predictionsData, usersData, teams] = await Promise.all([
			matchesRes.json(),
			predictionsRes.json(),
			usersRes.json(),
			teamsRes.json(),
		]);
		setMatches(matchesData);
		setPredictions(predictionsData);
		setUsers(usersData);
		setTeams(teams);
	}, []);

	// Listen for Firebase Auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				const res = await fetch(`/api/users/${firebaseUser.uid}`);
				const profile: User = res.ok
					? await res.json()
					: {
							uid: firebaseUser.uid,
							displayName: firebaseUser.displayName ?? "",
							email: firebaseUser.email ?? "",
							totalPoints: 0,
						};

				setCurrentUser(profile);
				setIsLoggedIn(true);
				await fetchAppData(firebaseUser.uid);
			} else {
				setIsLoggedIn(false);
				setCurrentUser(null);
				setMatches([]);
				setPredictions([]);
				setUsers([]);
			}
			setIsAuthLoading(false);
		});

		return () => unsubscribe();
	}, [fetchAppData]);

	const handleLogout = async () => {
		await signOut(auth);
	};

	const handleSavePrediction = async (
		matchId: string,
		predictHome: number | null,
		predictAway: number | null,
		predictPenalties: boolean = false,
		predictPenaltiesWinner: "HOME_TEAM" | "AWAY_TEAM" | null = null,
	) => {
		if (!currentUser) return;

		const res = await fetch("/api/predictions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				uid: currentUser.uid,
				matchId,
				predictHome,
				predictAway,
				predictPenalties,
				predictPenaltiesWinner,
			}),
		});
		const saved: Prediction = await res.json();

		setPredictions((prev) => {
			const idx = prev.findIndex(
				(p) => p.matchId === matchId && p.uid === currentUser.uid,
			);
			if (idx > -1) {
				const updated = [...prev];
				updated[idx] = saved;
				return updated;
			}
			return [...prev, saved];
		});
	};

	const handleUpdateProfile = async (displayName: string, photoURL: string) => {
		if (!currentUser) return;

		const res = await fetch(`/api/users/${currentUser.uid}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName, photoURL }),
		});
		const updated: User = await res.json();

		setCurrentUser(updated);
		setUsers((prev) =>
			prev.map((u) =>
				u.uid === currentUser.uid ? { ...u, displayName, photoURL } : u,
			),
		);
	};

	const selectedMatch = matches.find((m) => m.matchId === selectedMatchId);
	const userPredictionForSelected = predictions.find(
		(p) => p.matchId === selectedMatchId && p.uid === currentUser?.uid,
	);

	return {
		isLoggedIn,
		isAuthLoading,
		currentUser,
		activeTab,
		selectedMatchId,
		matches,
		predictions,
		users,
		teams,
		selectedMatch,
		userPredictionForSelected,
		handleLogout,
		handleSavePrediction,
		handleUpdateProfile,
		setSelectedMatchId,
		setActiveTab,
	};
}
