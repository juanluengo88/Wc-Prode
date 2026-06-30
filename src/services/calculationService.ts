import { Match } from "@/lib/mockData";
import { Prediction } from "@/services/predictionService";

/**
 * @returns
 */
export function assertPrediction(prediction: Prediction, match: Match): number {
	// Penalty prediction path
	if (prediction.predictPenalties) {
		if (match.scoreDuration !== "PENALTY_SHOOTOUT") return 0;
		return prediction.predictPenaltiesWinner === match.winner ? 3 : 0;
	}

	// Regular prediction path
	const realHome = match.scoreRegularHome ?? match.scoreHome;
	const realAway = match.scoreRegularAway ?? match.scoreAway;
	const predHome = prediction.predictHome;
	const predAway = prediction.predictAway;

	if (
		realHome === null ||
		realAway === null ||
		predHome === null ||
		predAway === null ||
		isNaN(predHome) ||
		isNaN(predAway)
	) {
		return 0;
	}

	if (predHome === realHome && predAway === realAway) {
		return 3;
	}

	const winner =
		match.winner ??
		(realHome > realAway
			? "HOME_TEAM"
			: realAway > realHome
				? "AWAY_TEAM"
				: "DRAW");
	const predictedWinner =
		predHome > predAway
			? "HOME_TEAM"
			: predAway > predHome
				? "AWAY_TEAM"
				: "DRAW";

	return winner === predictedWinner ? 1 : 0;
}
