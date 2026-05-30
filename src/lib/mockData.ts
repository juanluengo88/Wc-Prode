export interface Match {
  matchId: string;
  teamHome: string;
  teamAway: string;
  teamHomeFlag: string;
  teamAwayFlag: string;
  dateTime: string; // ISO string format
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  scoreHome: number | null;
  scoreAway: number | null;
  groupOrStage: string;
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
}

// Current simulated user
export const CURRENT_USER: User = {
  uid: 'user-current-123',
  displayName: 'Lionel Messi',
  email: 'leo@messi.com',
  photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  totalPoints: 14,
};

// Realistic flag mapping using FlagCDN (free & high quality) or beautiful fallback SVGs
export const getFlagUrl = (countryCode: string) => `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;

// World Cup Mock Matches
export const mockMatches: Match[] = [
  {
    matchId: 'match-1',
    teamHome: 'Qatar',
    teamAway: 'Ecuador',
    teamHomeFlag: getFlagUrl('qa'),
    teamAwayFlag: getFlagUrl('ec'),
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'FINISHED',
    scoreHome: 0,
    scoreAway: 2,
    groupOrStage: 'Grupo A',
  },
  {
    matchId: 'match-2',
    teamHome: 'Inglaterra',
    teamAway: 'Irán',
    teamHomeFlag: getFlagUrl('gb-eng'),
    teamAwayFlag: getFlagUrl('ir'),
    dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'FINISHED',
    scoreHome: 6,
    scoreAway: 2,
    groupOrStage: 'Grupo B',
  },
  {
    matchId: 'match-3',
    teamHome: 'Senegal',
    teamAway: 'Países Bajos',
    teamHomeFlag: getFlagUrl('sn'),
    teamAwayFlag: getFlagUrl('nl'),
    dateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'FINISHED',
    scoreHome: 0,
    scoreAway: 2,
    groupOrStage: 'Grupo A',
  },
  {
    matchId: 'match-4',
    teamHome: 'Argentina',
    teamAway: 'Arabia Saudita',
    teamHomeFlag: getFlagUrl('ar'),
    teamAwayFlag: getFlagUrl('sa'),
    dateTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago, finished
    status: 'FINISHED',
    scoreHome: 1,
    scoreAway: 2,
    groupOrStage: 'Grupo C',
  },
  {
    matchId: 'match-5',
    teamHome: 'Francia',
    teamAway: 'Australia',
    teamHomeFlag: getFlagUrl('fr'),
    teamAwayFlag: getFlagUrl('au'),
    dateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
    status: 'LIVE',
    scoreHome: 2,
    scoreAway: 1,
    groupOrStage: 'Grupo D',
  },
  {
    matchId: 'match-6',
    teamHome: 'Alemania',
    teamAway: 'Japón',
    teamHomeFlag: getFlagUrl('de'),
    teamAwayFlag: getFlagUrl('jp'),
    dateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Starts in 5 minutes (LOCKED!)
    status: 'SCHEDULED',
    scoreHome: null,
    scoreAway: null,
    groupOrStage: 'Grupo E',
  },
  {
    matchId: 'match-7',
    teamHome: 'España',
    teamAway: 'Costa Rica',
    teamHomeFlag: getFlagUrl('es'),
    teamAwayFlag: getFlagUrl('cr'),
    dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Starts in 4 hours
    status: 'SCHEDULED',
    scoreHome: null,
    scoreAway: null,
    groupOrStage: 'Grupo E',
  },
  {
    matchId: 'match-8',
    teamHome: 'Brasil',
    teamAway: 'Serbia',
    teamHomeFlag: getFlagUrl('br'),
    teamAwayFlag: getFlagUrl('rs'),
    dateTime: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(), // Starts in 28 hours
    status: 'SCHEDULED',
    scoreHome: null,
    scoreAway: null,
    groupOrStage: 'Grupo G',
  },
  {
    matchId: 'match-9',
    teamHome: 'Uruguay',
    teamAway: 'Corea del Sur',
    teamHomeFlag: getFlagUrl('uy'),
    teamAwayFlag: getFlagUrl('kr'),
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
    status: 'SCHEDULED',
    scoreHome: null,
    scoreAway: null,
    groupOrStage: 'Grupo H',
  },
  {
    matchId: 'match-10',
    teamHome: 'Portugal',
    teamAway: 'Ghana',
    teamHomeFlag: getFlagUrl('pt'),
    teamAwayFlag: getFlagUrl('gh'),
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 3 days
    status: 'SCHEDULED',
    scoreHome: null,
    scoreAway: null,
    groupOrStage: 'Grupo H',
  }
];

// Preloaded mock predictions for CURRENT_USER
export const mockPredictions: Prediction[] = [
  {
    predictionId: 'pred-1',
    uid: 'user-current-123',
    matchId: 'match-1',
    predictHome: 0,
    predictAway: 2,
    pointsEarned: 3, // Exact match score!
  },
  {
    predictionId: 'pred-2',
    uid: 'user-current-123',
    matchId: 'match-2',
    predictHome: 2,
    predictAway: 0,
    pointsEarned: 1, // Correct outcome (England win), wrong score (6-2 vs 2-0)
  },
  {
    predictionId: 'pred-3',
    uid: 'user-current-123',
    matchId: 'match-3',
    predictHome: 1,
    predictAway: 1,
    pointsEarned: 0, // Wrong outcome and score
  },
  {
    predictionId: 'pred-4',
    uid: 'user-current-123',
    matchId: 'match-4',
    predictHome: 3,
    predictAway: 1,
    pointsEarned: 0, // Wrong outcome (Argentina lost)
  },
  {
    predictionId: 'pred-5',
    uid: 'user-current-123',
    matchId: 'match-5',
    predictHome: 2,
    predictAway: 0,
    pointsEarned: null, // Match is live, not yet calculated
  },
  {
    predictionId: 'pred-6',
    uid: 'user-current-123',
    matchId: 'match-6',
    predictHome: 1,
    predictAway: 2,
    pointsEarned: null, // Scheduled & locked, no points yet
  }
];

// Leaderboard rankings
export const mockUsers: User[] = [
  {
    uid: 'user-1',
    displayName: 'Kylian Mbappé',
    email: 'kylian@mbappe.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 21,
  },
  {
    uid: 'user-2',
    displayName: 'Neymar Jr',
    email: 'neymar@jr.com',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 18,
  },
  {
    uid: 'user-3',
    displayName: 'Cristiano Ronaldo',
    email: 'cr7@portugal.com',
    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 16,
  },
  CURRENT_USER, // Leo Messi (14 points, Rank 4)
  {
    uid: 'user-4',
    displayName: 'Luka Modrić',
    email: 'luka@modric.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 12,
  },
  {
    uid: 'user-5',
    displayName: 'Kevin De Bruyne',
    email: 'kevin@debruyne.com',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 9,
  },
  {
    uid: 'user-6',
    displayName: 'Robert Lewandowski',
    email: 'robert@lewy.com',
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80',
    totalPoints: 6,
  }
].sort((a, b) => b.totalPoints - a.totalPoints).map((user, index) => ({
  ...user,
  rank: index + 1,
}));
