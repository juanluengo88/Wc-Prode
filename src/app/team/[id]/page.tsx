"use client";

import { useParams, useRouter } from "next/navigation";
import { useProde } from "../../../context/ProdeContext";

export default function TeamView() {
	const router = useRouter();
	const params = useParams();
	const teamId = params.id as string;

	const { isLoggedIn, isAuthLoading, teams, currentUser } = useProde();

	return <div>{teamId}</div>;
}
