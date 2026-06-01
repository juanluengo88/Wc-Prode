"use client";

import { useParams } from "next/navigation";
import { useProde } from "../../../context/ProdeContext";
import TeamView from "@/components/views/TeamView";

export default function Team() {
  const params = useParams();
  const id = params.id as string; 

  const { isLoggedIn, isAuthLoading, teams, currentUser } = useProde();
  
  
  if (isAuthLoading) return <div className="text-center p-10">Verificando sesión...</div>;

  return <TeamView teamId={id} />;
}