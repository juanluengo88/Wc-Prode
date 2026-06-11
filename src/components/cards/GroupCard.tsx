"use client";

import React, { useState } from "react";
import { GroupItem } from "@/hooks/useAdminView";

interface GroupCardProps {
    group: GroupItem;
}

export default function GroupCard({ group }: GroupCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
    
        const inviteLink = `${window.location.origin}/join/${group.id}`;
        
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Error al copiar enlace:", err);
        }
    };

    return (
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl transition-all overflow-hidden">
            {/* Header de la Card */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-950/80 transition-colors gap-3 select-none"
            >
                <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-slate-200 text-xs sm:text-sm truncate">{group.name}</span>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">{group.description || "Sin descripción"}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* Botón Copiar Link */}
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`py-1 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                            copied 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700"
                        }`}
                    >
                        {copied ? <span>¡Copiado!</span> : <span>Invitar</span>}
                    </button>

                    {/* Flecha Dropdown */}
                    <div className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-400" : ""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Desplegable de Usuarios Miembros */}
            {isOpen && (
                <div className="border-t border-slate-900/60 bg-slate-950/20 px-3.5 py-3 space-y-2 max-h-[180px] overflow-y-auto animate-fadeIn">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                        Participantes del Grupo ({group.members?.length || 0})
                    </span>

                    {!group.members || group.members.length === 0 ? (
                        <div className="text-[10px] text-slate-600 italic py-2">
                            Aún no se han unido participantes a este grupo.
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {group.members.map((member) => {
                                // 🌟 MAPEO ASEGURADO CON TU JSON REAL:
                                const name = member.displayName || "Usuario";
                                const photo = member.photoURL || "";
                                const points = member.totalPoints ?? 0;
                                const initial = name.charAt(0).toUpperCase();

                                return (
                                    <div 
                                        key={member.uid || member.id} 
                                        className="flex items-center justify-between py-1 border-b border-slate-900/40 last:border-0 text-[11px]"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {photo ? (
                                                <img 
                                                    src={photo} 
                                                    alt={name} 
                                                    className="w-5 h-5 rounded-full object-cover border border-slate-800" 
                                                />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-slate-800 text-[9px] text-slate-400 font-bold flex items-center justify-center uppercase">
                                                    {initial}
                                                </div>
                                            )}
                                            <span className="font-semibold text-slate-300 truncate">
                                                {name}
                                            </span>
                                        </div>
                                        <span className="font-mono font-bold text-amber-400 shrink-0">
                                            {points} pts
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}