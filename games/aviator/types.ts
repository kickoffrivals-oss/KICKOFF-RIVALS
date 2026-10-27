
export enum GameStatus {
  IDLE = 'IDLE',
  FLYING = 'FLYING',
  CRASHED = 'CRASHED',
}

export interface Bet {
  id: string;
  amount: number;
  cashedOutAt?: number;
  roundId: number;
}

export interface HistoryItem {
  multiplier: number;
  timestamp: number;
  headline?: string;
  roundId: number;
  reveal: string; 
  nonce: number;  
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
  isClaimed: boolean;
}

export interface DailyTasks {
  hasFollowedX: boolean;
  hasRetweeted: boolean;
  hasSpreadWord: boolean;
  hasReadBriefing: boolean;
  lastReset: string;
}
