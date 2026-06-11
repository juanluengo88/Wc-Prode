"use client";

import { User } from "@/lib/mockData";
import { useState, useEffect, useRef } from "react";

export interface AdminUserList {
	id: string;
	uid: string;
	displayName: string;
	email: string;
	totalPoints: number;
	photoURL?: string;
	admin?: boolean;
	groupId?: string | null;
}

export interface GroupItem {
	id: string;
	name: string;
	description?: string;
	createdAt?: string;
	members?: AdminUserList[];
}

export function useAdminConsole({ currentUser }: { currentUser: User | null }) {
	const [subTab, setSubTab] = useState<"users" | "groups">("users");

	// Estados Usuarios
	const [adminUsers, setAdminUsers] = useState<AdminUserList[]>([]);
	const [loadingAdmin, setLoadingAdmin] = useState(false);
	const fetchedUsers = useRef(false);
	const [editingUserId, setEditingUserId] = useState<string | null>(null);
	const [newPointsVal, setNewPointsVal] = useState("");
	const [adminSearch, setAdminSearch] = useState("");

	// Estados Grupos
	const [groups, setGroups] = useState<GroupItem[]>([]);
	const [loadingGroups, setLoadingGroups] = useState(false);
	const fetchedGroups = useRef(false);
	const [groupName, setGroupName] = useState("");
	const [groupDesc, setGroupDesc] = useState("");
	const [isCreatingGroup, setIsCreatingGroup] = useState(false);
	const [groupSuccess, setGroupSuccess] = useState(false);

	useEffect(() => {
		if (subTab === "users") {
			if (fetchedUsers.current) return;
			fetchedUsers.current = true;
			setLoadingAdmin(true);
			fetch("/api/users")
				.then((res) => (res.ok ? res.json() : null))
				.then((json) => {
					if (json) setAdminUsers(json.users || json || []);
				})
				.catch((err) => {
					console.error("Error al cargar usuarios:", err);
					fetchedUsers.current = false;
				})
				.finally(() => setLoadingAdmin(false));
		} else if (subTab === "groups") {
			if (fetchedGroups.current) return;
			fetchedGroups.current = true;
			setLoadingGroups(true);
			fetch("/api/groups")
				.then((res) => (res.ok ? res.json() : null))
				.then((json) => {
					if (json) setGroups(json.groups || []);
				})
				.catch((err) => {
					console.error("Error al cargar grupos:", err);
					fetchedGroups.current = false;
				})
				.finally(() => setLoadingGroups(false));
		}
	}, [subTab]);

	const handleUpdateUserPoints = async (targetUserId: string) => {
		const pointsNum = parseInt(newPointsVal);
		if (isNaN(pointsNum)) return;

		try {
			const res = await fetch(`/api/users/${targetUserId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ totalPoints: pointsNum }),
			});

			if (res.ok) {
				setAdminUsers((prev) =>
					prev.map((u) =>
						u.id === targetUserId || u.uid === targetUserId
							? { ...u, totalPoints: pointsNum }
							: u,
					),
				);

				setGroups((prevGroups) =>
					prevGroups.map((g) => ({
						...g,
						members: g.members?.map((m) =>
							m.id === targetUserId || m.uid === targetUserId
								? { ...m, totalPoints: pointsNum }
								: m,
						),
					})),
				);

				setEditingUserId(null);
				setNewPointsVal("");
			}
		} catch (err) {
			console.error("Error al modificar puntos:", err);
		}
	};

	const handleCreateGroup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!groupName.trim()) return;

		setIsCreatingGroup(true);
		try {
			const res = await fetch("/api/groups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: groupName,
					description: groupDesc,
					creatorUid: currentUser?.uid,
				}),
			});

			if (res.ok) {
				const json = await res.json();
				setGroups((prev) => [json.group, ...prev]);
				setGroupName("");
				setGroupDesc("");
				setGroupSuccess(true);
				setTimeout(() => setGroupSuccess(false), 3000);
			}
		} catch (err) {
			console.error("Error al crear grupo:", err);
		} finally {
			setIsCreatingGroup(false);
		}
	};

	const handleDeleteGroup = async (groupId: string) => {
		setIsCreatingGroup(true);
		try {
			const res = await fetch(`/api/groups/${groupId}`, {
				method: "DELETE",
			});

			if (res.ok) {
				setGroups((prev) => prev.filter((g) => g.id !== groupId));
				setGroupSuccess(true);
				setTimeout(() => setGroupSuccess(false), 3000);
			}
		} catch (err) {
			console.error("Error al borrar grupo:", err);
		} finally {
			setIsCreatingGroup(false);
		}
	};

	const filteredUsers = adminUsers.filter(
		(u) =>
			u.displayName?.toLowerCase().includes(adminSearch.toLowerCase()) ||
			u.email?.toLowerCase().includes(adminSearch.toLowerCase()),
	);

	return {
		subTab,
		setSubTab,
		loadingAdmin,
		filteredUsers,
		adminSearch,
		setAdminSearch,
		editingUserId,
		setEditingUserId,
		newPointsVal,
		setNewPointsVal,
		handleUpdateUserPoints,
		groups,
		loadingGroups,
		groupName,
		setGroupName,
		groupDesc,
		setGroupDesc,
		isCreatingGroup,
		groupSuccess,
		handleCreateGroup,
		handleDeleteGroup,
	};
}
