"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProde } from "@/context/ProdeContext";

export default function InviteGroupPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;

    const { currentUser, isAuthLoading } = useProde();

    const [status, setStatus] = useState<
        "checking" | "joining" | "success" | "error" | "unauthenticated"
    >("checking");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        // 1. Esperamos a que Firebase resuelva la sesión
        if (isAuthLoading) return;

        // 2. Si no hay sesión, guardamos la URL y mostramos el botón de login
        if (!currentUser) {
            sessionStorage.setItem("pendingInviteUrl", `/invite/group/${groupId}`);
            setStatus("unauthenticated");
            return;
        }

        // 🌟 EL FRENO DE MANO: Si ya pasamos de "checking", cortamos acá para no disparar 2 veces
        if (status !== "checking") return;

        // 3. Disparamos la petición POST
        const joinGroup = async () => {
            setStatus("joining");
            try {
                const res = await fetch(`/api/groups/add/${groupId}/user/${currentUser.uid}`, {
                    method: "POST", 
                });

                // 🌟 Leemos SIEMPRE la respuesta para ver qué hizo realmente el backend
                const data = await res.json();

                if (res.ok) {
                    console.log("✅ ¡Éxito al unir al grupo!", data);
                    setStatus("success");
                    
                    // Redirigimos a los 2 segundos
                    setTimeout(() => {
                        router.replace("/leaderboard");
                    }, 2000);
                } else {
                    console.error("❌ Error del servidor:", data);
                    setErrorMsg(data.error || "No pudimos unirte al grupo.");
                    setStatus("error");
                }
            } catch (err) {
                console.error("❌ Error de red:", err);
                setErrorMsg("Fallo en la conexión de red.");
                setStatus("error");
            }
        };

        joinGroup();
    }, [currentUser, isAuthLoading, groupId, router, status]);

    const handleGoToLogin = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-sm w-full bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-sm">
                
                {/* Ícono dinámico según estado */}
                <div className="flex justify-center mb-6">
                    {status === "success" ? (
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    ) : status === "error" ? (
                        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/30 animate-pulse">
                            <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}
                </div>

                {status === "checking" && (
                    <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Verificando credenciales...</h2>
                )}

                {status === "joining" && (
                    <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Vinculando tu usuario al grupo...</h2>
                )}

                {status === "success" && (
                    <>
                        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">¡Inscripción Exitosa!</h2>
                        <p className="text-xs text-slate-400">Redirigiendo a la tabla de posiciones...</p>
                    </>
                )}

                {status === "unauthenticated" && (
                    <>
                        <h2 className="text-base font-extrabold text-white uppercase tracking-tight">Acceso Requerido</h2>
                        <p className="text-xs text-slate-400 mb-6">Debes iniciar sesión para aceptar esta invitación y unirte al grupo.</p>
                        <button
                            onClick={handleGoToLogin}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl transition-colors"
                        >
                            Ir a Iniciar Sesión
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">Error al Unirse</h2>
                        <p className="text-xs text-slate-400 mb-6">{errorMsg}</p>
                        <button
                            onClick={() => router.push("/fixture")}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-colors"
                        >
                            Ir al Inicio
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}