"use client";

import { useState, useEffect } from "react";

export interface AdminUserList {
    id: string;
    displayName: string;
    email: string;
    totalPoints: number;
    photoURL?: string;
    admin?: boolean;
}

export interface GroupItem {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
    members?: AdminUserList[]; 
}

export function useAdminConsole() {
    const [subTab, setSubTab] = useState<"users" | "groups">("users");

    // Estados Usuarios
    const [adminUsers, setAdminUsers] = useState<AdminUserList[]>([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [newPointsVal, setNewPointsVal] = useState("");
    const [adminSearch, setAdminSearch] = useState("");

    // Estados Grupos
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupSuccess, setGroupSuccess] = useState(false);

    useEffect(() => {
        if (subTab === "users") {
            fetchUsers();
        } else if (subTab === "groups") {
            fetchGroups();
        }
    }, [subTab]);

    const fetchUsers = async () => {
        setLoadingAdmin(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const json = await res.json();
                setAdminUsers(json || []);
            }
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
        } finally {
            setLoadingAdmin(false);
        }
    };

    const fetchGroups = async () => {
        setLoadingGroups(true);
        try {
            const res = await fetch("/api/groups");
            if (res.ok) {
                const json = await res.json();
                setGroups(json.groups || []);
            }
        } catch (err) {
            console.error("Error al cargar grupos:", err);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleUpdateUserPoints = async (targetUserId: string) => {
        const pointsNum = parseInt(newPointsVal);
        if (isNaN(pointsNum)) return;

        try {
            const res = await fetch(`/api/user/${targetUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ totalPoints: pointsNum })
            });

            if (res.ok) {
                setAdminUsers(prev => 
                    prev.map(u => u.id === targetUserId ? { ...u, totalPoints: pointsNum } : u)
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
                body: JSON.stringify({ name: groupName, description: groupDesc })
            });

            if (res.ok) {
                const json = await res.json();
                setGroups(prev => [json.group, ...prev]);
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

    const filteredUsers = adminUsers.filter(u => 
        u.displayName?.toLowerCase().includes(adminSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(adminSearch.toLowerCase())
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
        handleCreateGroup
    };
}