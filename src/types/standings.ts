export interface StandingsData {
	currentMatchday: number;
	season: {
		startDate: string;
		endDate: string;
		currentMatchday: number;
	};
	standings: StandingGroup[];
	scorers: Scorer[];
}

export interface StandingGroup {
	stage: string;
	type: string;
	group: string;
	table: TeamRow[];
}

export interface TeamRow {
	position: number;
	team: {
		id: number;
		name: string;
		shortName: string;
		tla: string;
		crest: string;
	};
	playedGames: number;
	won: number;
	draw: number;
	lost: number;
	points: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
}

export interface Scorer {
	player: {
		id: number;
		name: string;
		nationality: string;
	};
	team: {
		id: number;
		name: string;
		shortName: string;
		tla: string;
		crest: string;
	};
	playedMatches: number;
	goals: number;
	assists: number | null;
	penalties: number | null;
}
