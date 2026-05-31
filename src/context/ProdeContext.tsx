"use client";

import React, { createContext, useContext } from "react";
import { useProdeApp } from "../hooks/useProdeApp";

type ProdeContextType = ReturnType<typeof useProdeApp>;

const ProdeContext = createContext<ProdeContextType | null>(null);

export function ProdeProvider({ children }: { children: React.ReactNode }) {
	const value = useProdeApp();
	return (
		<ProdeContext.Provider value={value}>{children}</ProdeContext.Provider>
	);
}

export function useProde() {
	const context = useContext(ProdeContext);
	if (!context) {
		throw new Error("useProde must be used within a ProdeProvider");
	}
	return context;
}
