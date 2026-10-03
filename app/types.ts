
export type AppTheme = 'default' | 'christmas' | 'easter' | 'newyear' | 'eid_fitr' | 'eid_adha';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  isVerified: boolean;
  verificationSignature: string | null;
  verificationTimestamp: number | null;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  strength: number;
  leagueId: string;
  logo?: string;
}

export interface MatchEvent {
  minute: number;
  description: string;
  type: 'goal' | 'card' | 'yellow_card' | 'red_card' | 'foul' | 'substitution' | 'chance' | 'whistle' | 'injury' | 'penalty_shout' | 'near_miss';
  teamId?: string;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  summary: string;
  serverSeed?: string; // Revealed after match
}

export interface Match {
  id: string;
  leagueId: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: number;
  odds: {
    home: number;
    draw: number;
    away: number;
    gg: number;      // Both Teams to Score
    nogg: number;    // Both Teams NOT to Score
  };
  result?: MatchResult;
  homeScore?: number | null;
  awayScore?: number | null;
  currentScore?: { home: number; away: number };
  status: 'SCHEDULED' | 'LIVE' | 'RESULT' | 'FINISHED';
  liveStartTime?: number; // Timestamp when match went live (for 10-second betting window)
  roundHash: string; // ClientSeed
  commitHash: string; // SHA256(ServerSeed)
  blockHash?: string; // External entropy
  seasonId: number;
  round: number;
  events?: MatchEvent[]; // Add events
  vrfRequestId?: string;
  vrfSeed?: string;
  isVerifiable?: boolean;
}

export interface Bet {
  id: string;
  matchId: string;
  selection: 'home' | 'draw' | 'away' | 'gg' | 'nogg';
  odds: number;
  stake: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost';
  timestamp: number;
  settledAt?: number;
  createdAt?: Date | string | number;
  txHash: string;
  betType?: 'single' | 'accumulator';  // Type of bet
  accumulatorId?: string;              // Group ID for accumulator bets
  homeTeamName?: string;
  awayTeamName?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  walletAddress?: string;
}

export interface BetSlipSelection {
  matchId: string;
  match: Match;
  selection: 'home' | 'draw' | 'away' | 'gg' | 'nogg';
  odds: number;
  selectionLabel: string;
}

export interface LeagueEntry {
  teamId: string;
  teamName: string;
  color: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'bet' | 'win' | 'withdrawal' | 'bonus' | 'refund' | 'convert' | 'redeem' | 'referral' | 'sign_in' | 'sign_up' | 'claim';
  amount: number;
  currency: 'kor' | 'coins';
  description: string;
  timestamp: number;
  hash: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  reward: number;
  type: 'click' | 'play' | 'win' | 'bet' | 'social' | 'external' | 'referral';
  frequency: 'daily' | 'weekly' | 'once';
  target: number;
  progress: number;
  completed: boolean;
  status: 'LIVE' | 'QUEUED' | 'VERIFYING' | 'ARCHIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMABLE' | 'CLAIMED' | 'UNLOCKED';
  liveAt?: number; // timestamp
  externalUrl?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  verificationTime?: number; // milliseconds before verification completes
  verifiedAt?: number; // timestamp when verification was completed
  category?: 'social' | 'gameplay' | 'betting' | 'partners';
  requiresVerification?: boolean;
  verificationPlaceholder?: string;
  verificationType?: 'username' | 'link';
}

export interface UserStats {
  username: string;
  level: number;
  xp: number;
  totalBets: number;
  wins: number;
  biggestWin: number;
  walletAddress: string;
  currentStreak: number;
  longestStreak: number;
  bestOddsWon: number;
  dailyWalkPoints: number;
  lastWalkDate: string;
  coins: number;
  korBalance: number;
  unclaimedBalance: number;
  referralCode: string;
  hasReferred: boolean;
  referralCount: number; // New: track referral count
  referralEarnings: number; // New: track earnings from referrals
  loginStreak: number;
  lastLoginDate: string;
  lastWelcomeGiftDate?: string;
  // mystery box removed: lastMysteryBoxDate and spinsAvailable removed
  quests: DailyQuest[];
  activeTheme: AppTheme;
  allianceLeagueId?: string;
  allianceTeamId?: string;
  unclaimedAllianceRewards: number;
  canCheckIn?: boolean;
  nextCheckInIn?: number;
  lastCheckInDate?: string | Date | null;
}

export interface Coupon {
  code: string;
  type: 'theme' | 'coins';
  value: AppTheme | number;
  usageLimit: number;
  currentUsage: number;
}

export interface SeasonArchive {
  id: number;
  timestamp: number;
  matches: Record<number, Match[]>;
  standings: Record<string, LeagueEntry[]>;
}

export type GameState = 'BETTING' | 'LIVE' | 'RESULT' | 'FINISHED';
