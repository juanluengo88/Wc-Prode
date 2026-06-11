"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProde } from "../../context/ProdeContext";
import TopNavbar from "../../components/navigation/TopNavbar";
import BottomNav from "../../components/navigation/BottomNav";
import LeaderboardView from "../../components/views/LeaderboardView";
import { Group, User } from "../../lib/mockData"; // Asegúrate de importar tus interfaces de tipo

export default function LeaderboardPage() {
	const router = useRouter();
	const {
		isLoggedIn,
		isAuthLoading,
		currentUser,
		users: globalUsers,
	} = useProde();
	const [userGroups, setUserGroups] = useState<Group[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>(globalUsers);
	const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);

	useEffect(() => {
		if (!isAuthLoading && !isLoggedIn) router.push("/login");
	}, [isLoggedIn, isAuthLoading, router]);

	useEffect(() => {
		if (!currentUser) return;

		async function fetchUserGroups() {
			try {
				setIsLoadingGroups(true);
				// Le pegamos a tu API que busca los grupos donde el usuario es miembro
				const response = await fetch(`/api/groups/user/${currentUser?.uid}`);
				const data = await response.json();

				if (data.success && data.groups.length > 0) {
					setUserGroups(data.groups);

					// Por defecto, cargamos el ranking del primer grupo de la lista
					const firstGroupId = data.groups[0].gId;
					await fetchGroupLeaderboard(firstGroupId);
				} else {
					// Si el usuario no está en ningún grupo privado, mostramos el ranking global de la app
					setFilteredUsers(globalUsers);
				}
			} catch (error) {
				console.error("Error al cargar los grupos del usuario:", error);
				setFilteredUsers(globalUsers); // Fallback seguro
			} finally {
				setIsLoadingGroups(false);
			}
		}

		fetchUserGroups();
	}, [currentUser, globalUsers]);

	// 🎯 2. FUNCIÓN PARA CAMBIAR DE GRUPO (Se ejecuta al tocar las pestañas en la vista)
	const handleGroupChange = async (groupId: string) => {
		await fetchGroupLeaderboard(groupId);
	};

	// Helper para pegarle a tu endpoint de ranking por grupo
	const fetchGroupLeaderboard = async (groupId: string) => {
		try {
			const response = await fetch(`/api/groups/${groupId}/leaderboard`);
			const data = await response.json();

			if (data.success) {
				// Seteamos la lista de usuarios que devolvió la API (solo los miembros del grupo)
				setFilteredUsers(data.leaderboard);
			}
		} catch (error) {
			console.error(
				`Error al obtener el leaderboard para el grupo ${groupId}:`,
				error,
			);
		}
	};

	// Pantalla de carga mientras se verifican credenciales o sesiones de la base de datos
	if (isAuthLoading || !isLoggedIn || !currentUser || isLoadingGroups) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
				Cargando sesiones y clasificaciones...
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
			<TopNavbar />

			<div className="flex-1 flex flex-col">
				{/* 
                  Pasamos las nuevas propiedades calculadas de forma dinámica:
                  - userGroups: Pestañas con los nombres de sus ligas (Familia, Amigos, etc.)
                  - users: El array mutado que contiene únicamente a los competidores de esa sesión
                */}
				<LeaderboardView
					currentUser={currentUser}
					users={filteredUsers}
					userGroups={userGroups}
					onGroupChange={handleGroupChange}
				/>
			</div>

			<BottomNav />
		</div>
	);
}
