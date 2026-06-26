const BASE_URL ="https://api.football-data.org/v4";

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

export async function fetchSingleMatch(matchId: string, token: string): Promise<ApiMatch> {
	const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
		headers: { "X-Auth-Token": token },
	});

	if (!res.ok) {
		throw new Error(`football-data.org error ${res.status}: ${await res.text()}`);
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

// ─── Mapping helpers ──────────────────────────────────────────────────────────

export function mapStatus(
	apiStatus: string,
): "SCHEDULED" | "LIVE" | "FINISHED" {
	if (["IN_PLAY", "PAUSED"].includes(apiStatus)) return "LIVE";
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
