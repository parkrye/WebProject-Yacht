export interface Player {
  id: string;
  name: string;
  scoreCard: ScoreCard;
}

export interface ScoreCard {
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  threeOfAKind: number | null;
  fourOfAKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  choice: number | null;
  yacht: number | null;
}

export interface DiceSet {
  values: number[];
  kept: boolean[];
  rollCount: number;
}

export type GamePhase = 'waiting' | 'rolling' | 'scoring' | 'finished';

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

export type ScoreCategory = keyof ScoreCard;

export const SCORE_CATEGORIES: { key: ScoreCategory; label: string }[] = [
  { key: 'ones', label: 'Ones' },
  { key: 'twos', label: 'Twos' },
  { key: 'threes', label: 'Threes' },
  { key: 'fours', label: 'Fours' },
  { key: 'fives', label: 'Fives' },
  { key: 'sixes', label: 'Sixes' },
  { key: 'threeOfAKind', label: 'Three of a Kind' },
  { key: 'fourOfAKind', label: 'Four of a Kind' },
  { key: 'fullHouse', label: 'Full House' },
  { key: 'smallStraight', label: 'Small Straight' },
  { key: 'largeStraight', label: 'Large Straight' },
  { key: 'choice', label: 'Choice' },
  { key: 'yacht', label: 'Yacht' },
];
