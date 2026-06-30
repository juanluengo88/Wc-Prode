const BASE_URL =
	process.env.FOOTBALL_DATA_BASE_URL ?? "https://api.football-data.org/v4";

export interface ApiTeam {
	id: number | null;
	name: string;
	tla: string;
	crest: string;
}

export interface ApiMatch {
	id: number;
	utcDate: string;
	status: string;
	matchday: number | null;
	stage: string;
	group: string | null;
	homeTeam: ApiTeam;
	awayTeam: ApiTeam;
	score: {
		winner: string | null;
		duration: string | null;
		fullTime: { home: number | null; away: number | null };
		regularTime: { home: number | null; away: number | null } | null;
		extraTime: { home: number | null; away: number | null } | null;
		penalties: { home: number | null; away: number | null } | null;
	};
}

export interface Squad {
	id: number;
	name: string;
	coach: string;
	squad: string;
	nationality: string;
}

export interface Team {
	teamId: string;
	name: string;
	coach: string;
	squad: Squad[];
}

export interface ApiMatchesResponse {
	matches: ApiMatch[];
}

export async function fetchSingleMatch(
	matchId: string,
	token: string,
): Promise<ApiMatch> {
	const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
		headers: { "X-Auth-Token": token },
	});

	if (!res.ok) {
		throw new Error(
			`football-data.org error ${res.status}: ${await res.text()}`,
		);
	}

	return res.json();
}

export async function fetchWCMatches(token: string): Promise<ApiMatch[]> {
	const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
		headers: { "X-Auth-Token": token },
	});

	if (!res.ok) {
		throw new Error(
			`football-data.org error ${res.status}: ${await res.text()}`,
		);
	}

	const data: ApiMatchesResponse = await res.json();
	return data.matches;
}

export async function fetchTeamData(
	teamId: number,
	token: string,
): Promise<{ name: string; coach: string; squad: Squad[] } | number> {
	let teamData: Response | null = null;
	let teamDataJson = null;
	try {
		teamData = await fetch(`${BASE_URL}/teams/${teamId}`, {
			headers: { "X-Auth-Token": token },
		});
		teamDataJson = await teamData.json();
		teamDataJson = {
			name: teamDataJson.name ?? null,
			coach: teamDataJson.coach?.name ?? null,
			squad: teamDataJson.squad ?? [],
		};
	} catch (error) {
		if (teamData && teamData.status === 429) {
			console.warn(`Hammering API too much, waiting before retrying...`);
			return parseInt(teamData.headers.get("X-RequestCounter-Reset") || "0");
		} else {
			console.error(`Error fetching team ${teamId}:`, error);
			throw error;
		}
	}
	return teamDataJson;
}

// ─── ESPN API ─────────────────────────────────────────────────────────────────

export async function fetchESPNMatch(espnMatchId: string): Promise<ApiMatch> {
	const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${espnMatchId}&lang=es&region=ar`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`ESPN API error ${res.status}: ${await res.text()}`);
	}
	return mapESPNToApiMatch(await res.json(), espnMatchId);
}

function mapESPNToApiMatch(data: any, espnMatchId: string): ApiMatch {
	const competition = data?.header?.competitions?.[0];
	const state = competition?.status?.type?.state;
	const period: number = competition?.status?.period ?? 0;

	let status: string;
	if (state === "in") {
		const name = competition?.status?.type?.name ?? "";
		status = name === "STATUS_HALFTIME" ? "PAUSED" : "IN_PLAY";
	} else if (state === "post") {
		status = "FINISHED";
	} else {
		status = "SCHEDULED";
	}

	const competitors: any[] = competition?.competitors ?? [];
	const homeComp = competitors.find((c) => c.homeAway === "home");
	const awayComp = competitors.find((c) => c.homeAway === "away");

	const fullTimeHome =
		homeComp?.score !== undefined ? parseInt(homeComp.score) : null;
	const fullTimeAway =
		awayComp?.score !== undefined ? parseInt(awayComp.score) : null;

	// Penalties — prefer shootoutScore on competitors, fall back to boxscore stats
	const parsePenScore = (val: any) =>
		val !== undefined && val !== "" && val !== null ? parseInt(val) : null;

	let penHome = parsePenScore(homeComp?.shootoutScore);
	let penAway = parsePenScore(awayComp?.shootoutScore);

	if (penHome === null || penAway === null) {
		const statsHome =
			data?.boxscore?.teams?.find((t: any) => t.homeAway === "home")
				?.statistics ?? [];
		const statsAway =
			data?.boxscore?.teams?.find((t: any) => t.homeAway === "away")
				?.statistics ?? [];
		const penStatHome = statsHome.find(
			(s: any) => s.name === "penaltyKickGoals",
		)?.displayValue;
		const penStatAway = statsAway.find(
			(s: any) => s.name === "penaltyKickGoals",
		)?.displayValue;
		if (penHome === null) penHome = parsePenScore(penStatHome);
		if (penAway === null) penAway = parsePenScore(penStatAway);
	}

	const hasPenalties =
		penHome !== null && penAway !== null && (penHome > 0 || penAway > 0);

	let duration: string | null = null;
	if (status === "FINISHED") {
		if (hasPenalties || period >= 5) duration = "PENALTY_SHOOTOUT";
		else if (period >= 3) duration = "EXTRA_TIME";
		else duration = "REGULAR_TIME";
	}

	let winner: string | null = null;
	if (status === "FINISHED" && fullTimeHome !== null && fullTimeAway !== null) {
		if (hasPenalties && penHome !== null && penAway !== null) {
			winner = penHome > penAway ? "HOME_TEAM" : "AWAY_TEAM";
		} else if (fullTimeHome > fullTimeAway) {
			winner = "HOME_TEAM";
		} else if (fullTimeAway > fullTimeHome) {
			winner = "AWAY_TEAM";
		} else {
			winner = "DRAW";
		}
	}

	return {
		id: parseInt(espnMatchId),
		utcDate: competition?.date ?? "",
		status,
		matchday: null,
		stage: "",
		group: null,
		homeTeam: {
			id: null,
			name: homeComp?.team?.displayName ?? "",
			tla: homeComp?.team?.abbreviation ?? "",
			crest: homeComp?.team?.logo ?? "",
		},
		awayTeam: {
			id: null,
			name: awayComp?.team?.displayName ?? "",
			tla: awayComp?.team?.abbreviation ?? "",
			crest: awayComp?.team?.logo ?? "",
		},
		score: {
			winner,
			duration,
			fullTime: { home: fullTimeHome, away: fullTimeAway },
			regularTime: { home: fullTimeHome, away: fullTimeAway },
			extraTime: null,
			penalties: hasPenalties ? { home: penHome, away: penAway } : null,
		},
	};
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

export function mapStatus(
	apiStatus: string,
): "SCHEDULED" | "LIVE" | "FINISHED" {
	if (["IN_PLAY", "PAUSED", "LIVE"].includes(apiStatus)) return "LIVE";
	if (apiStatus === "FINISHED") return "FINISHED";
	return "SCHEDULED";
}

export function mapGroupOrStage(match: ApiMatch): string {
	if (match.group) {
		// GROUP_A → Grupo A
		return match.group.replace("GROUP_", "Grupo ");
	}
	const stageLabels: Record<string, string> = {
		GROUP_STAGE: "Fase de Grupos",
		LAST_16: "Octavos de Final",
		LAST_32: "Dieciseisavos de Final",
		QUARTER_FINALS: "Cuartos de Final",
		SEMI_FINALS: "Semifinal",
		THIRD_PLACE: "Tercer Puesto",
		FINAL: "Final",
	};
	return stageLabels[match.stage] ?? match.stage;
}
