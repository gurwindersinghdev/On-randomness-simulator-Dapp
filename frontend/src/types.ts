export interface DiceRollResult {
  id: string; // Digest or pseudo ID
  guess: number;
  rolled: number;
  won: boolean;
  timestamp: number;
  isOnChain: boolean;
}

export interface GameStats {
  totalRolls: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
}

