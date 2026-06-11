"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { useProde } from "@/context/ProdeContext"; 
import TopNavbar from "@/components/navigation/TopNavbar";
import AdminConsoleView from "@/components/views/AdminConsoleView";
import FixtureNavBar from "@/components/navigation/FixtureNavBar";
import BottomNav from "@/components/navigation/BottomNav";

export default function AdminPage() {
  const router = useRouter();
  
  const { currentUser, isAuthLoading: loading } = useProde(); 

  useEffect(() => {
    if (!loading && (!currentUser || currentUser.admin !== true)) {
      router.replace("/fixture");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-400 font-medium tracking-widest gap-3">
        <span>VERIFICANDO CREDENCIALES STAFF...</span>
      </div>
    );
  }

  if (!currentUser || currentUser.admin !== true) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TopNavbar />
      <main className="max-w-xl mx-auto w-full px-4 py-8 space-y-6">
        <AdminConsoleView />
      </main> 
    </div>
  );
}