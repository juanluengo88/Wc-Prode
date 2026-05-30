"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProde } from "../../context/ProdeContext";
import LoginView from "../../components/views/LoginView";

export default function LoginPage() {
	const router = useRouter();
	const { isLoggedIn, isAuthLoading } = useProde();

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.push("/fixture");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	if (isAuthLoading) return null;

	return <LoginView />;
}
