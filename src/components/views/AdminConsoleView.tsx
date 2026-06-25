"use client";

import { useAdminConsole } from "@/hooks/useAdminView";
import GroupCard from "../cards/GroupCard";
import { useProde } from "@/context/ProdeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminConsoleView() {
	const { currentUser } = useProde();
	const { t } = useLanguage();

	const {
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
	} = useAdminConsole({ currentUser });

	return (
		<div className="bg-slate-900/40 border border-slate-900 p-5 rounded-3xl space-y-6">
			{/* Sub tabs */}
			<div className="flex gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
				<button
					type="button"
					onClick={() => setSubTab("users")}
					className={`pb-2 px-1 transition-all border-b-2 ${subTab === "users" ? "border-amber-500 text-white" : "border-transparent text-slate-500 hover:text-slate-350"}`}
				>
					{t("admin_tabUsers")}
				</button>
				<button
					type="button"
					onClick={() => setSubTab("groups")}
					className={`pb-2 px-1 transition-all border-b-2 ${subTab === "groups" ? "border-amber-500 text-white" : "border-transparent text-slate-500 hover:text-slate-350"}`}
				>
					{t("admin_tabGroups")}
				</button>
			</div>

			{/* Users tab */}
			{subTab === "users" && (
				<div className="space-y-4">
					<div className="relative">
						<input
							type="text"
							value={adminSearch}
							onChange={(e) => setAdminSearch(e.target.value)}
							placeholder={t("admin_searchPlaceholder")}
							className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="w-4 h-4 text-slate-500 absolute left-3 top-3"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z"
							/>
						</svg>
					</div>

					{loadingAdmin ? (
						<div className="text-center py-12 text-slate-500 text-xs animate-pulse">
							{t("admin_loadingUsers")}
						</div>
					) : filteredUsers.length === 0 ? (
						<div className="text-center py-12 text-slate-600 text-xs italic">
							{t("admin_noUsers")}
						</div>
					) : (
						<div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
							{filteredUsers.map((u) => (
								<div
									key={u.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/60 border border-slate-900 p-3.5 rounded-2xl gap-3 text-xs"
								>
									<div className="flex items-center gap-3">
										{u.photoURL ? (
											<img
												src={u.photoURL}
												alt={u.displayName}
												className="w-9 h-9 rounded-full object-cover border border-slate-800"
											/>
										) : (
											<div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center uppercase">
												{u.displayName?.charAt(0) || "?"}
											</div>
										)}
										<div className="flex flex-col">
											<span className="font-bold text-slate-200 flex items-center gap-1.5">
												{u.displayName || t("admin_defaultName")}
												{u.admin && (
													<span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded uppercase">
														{t("admin_staffBadge")}
													</span>
												)}
											</span>
											<span className="text-[10px] text-slate-500">{u.email}</span>
										</div>
									</div>

									<div className="flex items-center justify-end gap-2 shrink-0">
										{editingUserId === u.id ? (
											<div className="flex items-center gap-1.5">
												<input
													type="text"
													value={newPointsVal}
													onChange={(e) => {
														if (/^\d*$/.test(e.target.value))
															setNewPointsVal(e.target.value);
													}}
													className="w-14 px-2 py-1 bg-slate-950 border border-amber-500 text-center font-bold text-white rounded-lg focus:outline-none"
												/>
												<button
													type="button"
													onClick={() => handleUpdateUserPoints(u.id)}
													className="px-2 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] uppercase"
												>
													Ok
												</button>
												<button
													type="button"
													onClick={() => {
														setEditingUserId(null);
														setNewPointsVal("");
													}}
													className="px-2 py-1 bg-slate-800 text-slate-400 font-bold rounded-lg text-[10px] uppercase"
												>
													X
												</button>
											</div>
										) : (
											<>
												<div className="bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-850 text-center min-w-14">
													<span className="block font-black text-amber-400 leading-tight">
														{u.totalPoints}
													</span>
													<span className="text-[8px] text-slate-500 uppercase font-medium">pts</span>
												</div>
												<button
													type="button"
													onClick={() => {
														setEditingUserId(u.id);
														setNewPointsVal(u.totalPoints.toString());
													}}
													className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-amber-400 transition-colors"
												>
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
														<path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
														<path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
													</svg>
												</button>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Groups tab */}
			{subTab === "groups" && (
				<div className="space-y-6 animate-fadeIn">
					<form
						onSubmit={handleCreateGroup}
						className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl space-y-3.5 text-xs"
					>
						<span className="font-black text-amber-400 tracking-wider uppercase block text-[10px]">
							{t("admin_createGroupTitle")}
						</span>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div>
								<label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
									{t("admin_labelGroupName")}
								</label>
								<input
									type="text"
									value={groupName}
									onChange={(e) => setGroupName(e.target.value)}
									placeholder={t("admin_placeholderGroupName")}
									className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
									required
								/>
							</div>
							<div>
								<label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
									{t("admin_labelGroupDesc")}
								</label>
								<input
									type="text"
									value={groupDesc}
									onChange={(e) => setGroupDesc(e.target.value)}
									placeholder={t("admin_placeholderGroupDesc")}
									className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
								/>
							</div>
						</div>

						{groupSuccess && (
							<div className="p-2 text-center font-semibold bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
								{t("admin_successGroup")}
							</div>
						)}

						<button
							type="submit"
							disabled={isCreatingGroup || !groupName.trim()}
							className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold tracking-wide hover:from-amber-400 disabled:opacity-50 transition-all uppercase"
						>
							{isCreatingGroup ? t("admin_btnSavingGroup") : t("admin_btnCreateGroup")}
						</button>
					</form>

					<div className="space-y-2">
						<span className="font-black text-slate-400 tracking-wider uppercase block text-[10px]">
							{t("admin_existingGroups")}
						</span>

						{loadingGroups ? (
							<div className="text-center py-8 text-slate-500 text-xs animate-pulse">
								{t("admin_loadingGroups")}
							</div>
						) : groups.length === 0 ? (
							<div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-slate-850 rounded-2xl">
								{t("admin_noGroups")}
							</div>
						) : (
							<div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
								{groups.map((g) => (
									<GroupCard
										key={g.id}
										group={g}
										onDeleteGroup={handleDeleteGroup}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
