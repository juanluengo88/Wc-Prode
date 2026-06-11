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
            // 🌟 1. Buscamos si la página de invitación dejó un link pendiente
            const pendingUrl = sessionStorage.getItem("pendingInviteUrl");

            if (pendingUrl) {
                // 🌟 2. Si venía de una invitación, limpiamos la memoria
                sessionStorage.removeItem("pendingInviteUrl");
                
                // 🌟 3. Y lo devolvemos a la página de invitación
                router.push(pendingUrl);
            } else {
                // 🌟 4. Si entró por su cuenta normal, va al fixture
                router.push("/fixture");
            }
        }
    }, [isLoggedIn, isAuthLoading, router]);

    if (isAuthLoading) return null;

    return <LoginView />;
}