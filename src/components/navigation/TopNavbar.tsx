"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProde } from "../../context/ProdeContext";
import Image from "next/image";

export default function TopNavbar() {
    const router = useRouter();
    const { currentUser, handleLogout } = useProde();

    const handleLogoutAndRedirect = () => {
        handleLogout();
        router.push("/login");
    };

    // Manejador de navegación para el perfil común
    const handleProfileNavigation = () => {
        router.push("/profile");
    };

    return (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-4 py-3 sm:px-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                {/* App Logo - Click routes back to fixture dashboard */}
                <div
                    onClick={() => router.push("/fixture")}
                    className="flex items-center gap-3 cursor-pointer group active:scale-[0.98] transition-transform"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center relative">
                        <Image
                            src="/world-cup.svg"
                            alt="World Cup"
                            width={24}
                            height={24}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white bg-gradient-to-r from-amber-250 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase">
                            MUNDIAL PRODE
                        </h2>
                        <p className="text-[10px] text-slate-400 hidden sm:block">
                            Muestra tus conocimientos
                        </p>
                    </div>
                </div>

                {/* Profile and Logout Actions */}
                <div className="flex items-center gap-3">
                    
                    {/* 👑 TAB/BOTÓN EXCLUSIVO PARA ADMINISTRADORES */}
                    {currentUser?.admin && (
                        <button
                            onClick={() => router.push("/admin")}
                            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500 text-amber-400 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-full transition-all active:scale-[0.98]"
                            title="Abrir Consola de Administración"
                        >
                            {/* Icono de llave/herramienta de control */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M11.986 3H13a1 1 0 0 1 1 1v1.014a2.25 2.25 0 0 1-.659 1.591L11 9.94V13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9.94L2.659 6.605A2.25 2.25 0 0 1 2 5.014V4a1 1 0 0 1 1-1h1.014a2.25 2.25 0 0 1 1.591.659L7.94 5.99l2.334-2.332A2.25 2.25 0 0 1 11.986 3ZM9 9.94l2.155-2.154a.75.75 0 0 0-.024-1.037l-.014-.014a.75.75 0 0 0-1.037-.024L7.94 8.857 5.786 6.711a.75.75 0 0 0-1.037.024l-.014.014a.75.75 0 0 0 .024 1.037L6.94 9.94V13a.5.5 0 0 0 .5.5h1.5a.5.5 0 0 0 .5-.5V9.94Z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden md:inline">Consola Admin</span>
                            <span className="md:hidden">Admin</span>
                        </button>
                    )}

                    {/* Clickable Profile Card */}
                    <button
                        onClick={handleProfileNavigation}
                        className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-850 hover:border-slate-500 hover:scale-[1.02] active:scale-[0.98] py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-full border border-slate-700/60 cursor-pointer transition-all"
                        title={currentUser?.admin ? "Ver Consola Admin" : "Ver Perfil"}
                    >
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt={currentUser.displayName}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-[10px] sm:text-xs">
                                {currentUser?.displayName
                                    ? currentUser.displayName.charAt(0).toUpperCase()
                                    : "U"}
                            </div>
                        )}
                        <div className="text-xs sm:text-sm font-semibold flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-none sm:leading-normal">
                            <span className="text-slate-200 truncate max-w-[70px] sm:max-w-none flex items-center gap-1">
                                {currentUser?.displayName
                                    ? currentUser.displayName.split(" ")[0]
                                    : "Usuario"}
                                {currentUser?.admin && (
                                    <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-black uppercase tracking-wider">
                                        AD
                                    </span>
                                )}
                            </span>
                            <span className="text-amber-400 font-bold">
                                {currentUser?.totalPoints || 0} pts
                            </span>
                        </div>
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogoutAndRedirect}
                        className="text-xs text-slate-400 hover:text-red-400 transition-colors py-1 px-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </header>
    );
}