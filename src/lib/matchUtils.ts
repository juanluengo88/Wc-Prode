import type { Match } from './mockData';

/**
 * Returns true only when both team names are non-empty strings.
 * Knockout stage matches have empty/null team names until the previous
 * round is resolved — predictions must be disabled in that case.
 */
export function teamsAreDefined(match: Pick<Match, 'teamHome' | 'teamAway'>): boolean {
  return Boolean(match.teamHome?.trim()) && Boolean(match.teamAway?.trim());
}
