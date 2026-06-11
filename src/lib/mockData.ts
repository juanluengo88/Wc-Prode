export interface Match {
	matchId: string;
	teamHome: string;
	teamAway: string;
	teamHomeFlag: string;
	teamAwayFlag: string;
	dateTime: string; // ISO string
	status: "SCHEDULED" | "LIVE" | "FINISHED";
	scoreHome: number | null;
	scoreAway: number | null;
	groupOrStage: string;
	espnMatchId?: string;
}

export interface Prediction {
	predictionId: string;
	uid: string;
	matchId: string;
	predictHome: number;
	predictAway: number;
	pointsEarned: number | null;
}

export interface User {
	uid: string;
	displayName: string;
	email: string;
	photoURL?: string;
	totalPoints: number;
	rank?: number;
	admin:boolean;
}

export interface Group {
	gId: string;
	name: string;
	members: string[];
	inviteCode: string;
}

export const getFlagUrl = (countryCode: string) =>
	`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
