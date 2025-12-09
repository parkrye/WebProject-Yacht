export enum GamePhase {
  WAITING = 'waiting',
  ROLLING = 'rolling',
  SCORING = 'scoring',
  FINISHED = 'finished',
}

export enum ScoreCategory {
  // Upper Section
  ONES = 'ones',
  TWOS = 'twos',
  THREES = 'threes',
  FOURS = 'fours',
  FIVES = 'fives',
  SIXES = 'sixes',

  // Special Section
  THREE_OF_A_KIND = 'threeOfAKind',
  FOUR_OF_A_KIND = 'fourOfAKind',
  FULL_HOUSE = 'fullHouse',
  SMALL_STRAIGHT = 'smallStraight',
  LARGE_STRAIGHT = 'largeStraight',
  CHOICE = 'choice',
  YACHT = 'yacht',
}

export interface ScoreCard {
  [ScoreCategory.ONES]: number | null;
  [ScoreCategory.TWOS]: number | null;
  [ScoreCategory.THREES]: number | null;
  [ScoreCategory.FOURS]: number | null;
  [ScoreCategory.FIVES]: number | null;
  [ScoreCategory.SIXES]: number | null;
  [ScoreCategory.THREE_OF_A_KIND]: number | null;
  [ScoreCategory.FOUR_OF_A_KIND]: number | null;
  [ScoreCategory.FULL_HOUSE]: number | null;
  [ScoreCategory.SMALL_STRAIGHT]: number | null;
  [ScoreCategory.LARGE_STRAIGHT]: number | null;
  [ScoreCategory.CHOICE]: number | null;
  [ScoreCategory.YACHT]: number | null;
}

export interface DiceSet {
  values: number[];
  kept: boolean[];
  rollCount: number;
}

export interface Player {
  id: string;
  name: string;
  scoreCard: ScoreCard;
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  diceSet: DiceSet;
  phase: GamePhase;
  round: number;
  createdAt: number;
  updatedAt: number;
}

export interface TurnRecord {
  playerId: string;
  round: number;
  diceValues: number[];
  category: ScoreCategory;
  score: number;
  timestamp: number;
}
