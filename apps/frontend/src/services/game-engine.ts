import type { GameState, DiceSet, Player, GamePhase, ScoreCategory, ScoreCard } from '../types/game.types';

const GAME_CONSTANTS = {
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 1,
  DICE_COUNT: 5,
  MAX_ROLLS_PER_TURN: 3,
  DICE_MIN_VALUE: 1,
  DICE_MAX_VALUE: 6,
};

const SCORE_CONSTANTS = {
  YACHT_BONUS: 50,
  SMALL_STRAIGHT: 15,
  LARGE_STRAIGHT: 30,
  UPPER_BONUS_THRESHOLD: 63,
  UPPER_BONUS: 35,
};

const ALL_CATEGORIES: ScoreCategory[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'threeOfAKind', 'fourOfAKind', 'fullHouse',
  'smallStraight', 'largeStraight', 'choice', 'yacht'
];

function createEmptyScoreCard(): ScoreCard {
  return {
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    threeOfAKind: null,
    fourOfAKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    choice: null,
    yacht: null,
  };
}

function createDiceSet(): DiceSet {
  return {
    values: Array(GAME_CONSTANTS.DICE_COUNT).fill(0),
    kept: Array(GAME_CONSTANTS.DICE_COUNT).fill(false),
    rollCount: 0,
  };
}

function rollSingleDice(): number {
  return (
    Math.floor(
      Math.random() *
        (GAME_CONSTANTS.DICE_MAX_VALUE - GAME_CONSTANTS.DICE_MIN_VALUE + 1),
    ) + GAME_CONSTANTS.DICE_MIN_VALUE
  );
}

function rollDice(diceSet: DiceSet): DiceSet {
  if (diceSet.rollCount >= GAME_CONSTANTS.MAX_ROLLS_PER_TURN) {
    return diceSet;
  }

  const newValues = diceSet.values.map((value, index) => {
    if (diceSet.kept[index]) {
      return value;
    }
    return rollSingleDice();
  });

  return {
    ...diceSet,
    values: newValues,
    rollCount: diceSet.rollCount + 1,
  };
}

function getDiceCounts(values: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export function calculateScore(category: ScoreCategory, diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);
  const sorted = [...diceValues].sort((a, b) => a - b);
  const unique = [...new Set(sorted)];
  const sum = diceValues.reduce((s, v) => s + v, 0);

  switch (category) {
    case 'ones':
      return diceValues.filter((v) => v === 1).length * 1;
    case 'twos':
      return diceValues.filter((v) => v === 2).length * 2;
    case 'threes':
      return diceValues.filter((v) => v === 3).length * 3;
    case 'fours':
      return diceValues.filter((v) => v === 4).length * 4;
    case 'fives':
      return diceValues.filter((v) => v === 5).length * 5;
    case 'sixes':
      return diceValues.filter((v) => v === 6).length * 6;
    case 'threeOfAKind':
      for (const [value, count] of counts.entries()) {
        if (count >= 3) return value * 3;
      }
      return 0;
    case 'fourOfAKind':
      for (const [value, count] of counts.entries()) {
        if (count >= 4) return value * 4;
      }
      return 0;
    case 'fullHouse': {
      const countValues = Array.from(counts.values());
      if (
        (countValues.includes(3) && countValues.includes(2)) ||
        countValues.includes(5)
      ) {
        return sum;
      }
      return 0;
    }
    case 'smallStraight': {
      const smallStraights = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      for (const straight of smallStraights) {
        if (straight.every((v) => unique.includes(v))) {
          return SCORE_CONSTANTS.SMALL_STRAIGHT;
        }
      }
      return 0;
    }
    case 'largeStraight': {
      const largeStraights = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
      ];
      for (const straight of largeStraights) {
        if (straight.every((v) => unique.includes(v))) {
          return SCORE_CONSTANTS.LARGE_STRAIGHT;
        }
      }
      return 0;
    }
    case 'choice':
      return sum;
    case 'yacht':
      for (const count of counts.values()) {
        if (count === 5) return SCORE_CONSTANTS.YACHT_BONUS;
      }
      return 0;
    default:
      return 0;
  }
}

export interface TurnResult {
  success: boolean;
  message: string;
  gameState: GameState;
}

// 상단 섹션(1~6) 합계 계산
export function calculateUpperTotal(scoreCard: ScoreCard): number {
  const upperCategories: ScoreCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  return upperCategories.reduce((sum, cat) => {
    const score = scoreCard[cat];
    return sum + (typeof score === 'number' ? score : 0);
  }, 0);
}

// 상단 보너스 계산 (63점 이상이면 35점)
export function calculateUpperBonus(scoreCard: ScoreCard): number {
  const upperTotal = calculateUpperTotal(scoreCard);
  return upperTotal >= SCORE_CONSTANTS.UPPER_BONUS_THRESHOLD ? SCORE_CONSTANTS.UPPER_BONUS : 0;
}

// 총점 계산 (보너스 포함)
export function calculateTotalScore(scoreCard: ScoreCard): number {
  const allScores = Object.values(scoreCard).reduce((sum, score) => {
    return sum + (typeof score === 'number' ? score : 0);
  }, 0);
  const bonus = calculateUpperBonus(scoreCard);
  return allScores + bonus;
}

export class GameEngine {
  private gameState: GameState;

  constructor(gameId: string, hostId: string = '') {
    const now = Date.now();
    this.gameState = {
      id: gameId,
      hostId: hostId,
      players: [],
      currentPlayerIndex: 0,
      diceSet: createDiceSet(),
      phase: 'waiting' as GamePhase,
      round: 1,
      createdAt: now,
      updatedAt: now,
    };
  }

  getState(): GameState {
    return this.gameState;
  }

  setState(state: GameState): void {
    this.gameState = state;
  }

  addPlayer(playerId: string, playerName: string): boolean {
    if (this.gameState.players.length >= GAME_CONSTANTS.MAX_PLAYERS) {
      return false;
    }
    if (this.gameState.phase !== 'waiting') {
      return false;
    }
    if (this.gameState.players.find((p) => p.id === playerId)) {
      return false;
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      scoreCard: createEmptyScoreCard(),
    };
    this.gameState = {
      ...this.gameState,
      players: [...this.gameState.players, player],
      updatedAt: Date.now(),
    };
    return true;
  }

  startGame(): boolean {
    if (this.gameState.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      return false;
    }
    if (this.gameState.phase !== 'waiting') {
      return false;
    }

    const newDiceSet = rollDice(createDiceSet());
    this.gameState = {
      ...this.gameState,
      diceSet: newDiceSet,
      phase: 'rolling' as GamePhase,
      updatedAt: Date.now(),
    };
    return true;
  }

  roll(): TurnResult {
    if (this.gameState.phase !== 'rolling') {
      return {
        success: false,
        message: '주사위를 굴릴 수 없는 상태입니다.',
        gameState: this.gameState,
      };
    }

    if (this.gameState.diceSet.rollCount >= GAME_CONSTANTS.MAX_ROLLS_PER_TURN) {
      return {
        success: false,
        message: '더 이상 주사위를 굴릴 수 없습니다.',
        gameState: this.gameState,
      };
    }

    const newDiceSet = rollDice(this.gameState.diceSet);
    this.gameState = {
      ...this.gameState,
      diceSet: newDiceSet,
      updatedAt: Date.now(),
    };

    return {
      success: true,
      message: `주사위를 굴렸습니다. (${newDiceSet.rollCount}/3)`,
      gameState: this.gameState,
    };
  }

  setDiceKeepStatus(keepStatus: boolean[]): boolean {
    if (this.gameState.phase !== 'rolling') {
      return false;
    }
    if (keepStatus.length !== GAME_CONSTANTS.DICE_COUNT) {
      return false;
    }

    this.gameState = {
      ...this.gameState,
      diceSet: {
        ...this.gameState.diceSet,
        kept: [...keepStatus],
      },
      updatedAt: Date.now(),
    };
    return true;
  }

  selectScoreCategory(category: ScoreCategory): TurnResult {
    if (this.gameState.phase !== 'rolling') {
      return {
        success: false,
        message: '점수를 선택할 수 없는 상태입니다.',
        gameState: this.gameState,
      };
    }

    const currentPlayer =
      this.gameState.players[this.gameState.currentPlayerIndex];
    const existingScore = currentPlayer.scoreCard[category];

    if (existingScore !== null && existingScore !== undefined) {
      return {
        success: false,
        message: '이미 선택된 카테고리입니다.',
        gameState: this.gameState,
      };
    }

    const score = calculateScore(category, this.gameState.diceSet.values);

    const updatedPlayers = this.gameState.players.map((player, index) => {
      if (index !== this.gameState.currentPlayerIndex) {
        return player;
      }
      return {
        ...player,
        scoreCard: {
          ...player.scoreCard,
          [category]: score,
        },
      };
    });

    const nextIndex =
      (this.gameState.currentPlayerIndex + 1) %
      this.gameState.players.length;
    const isNewRound = nextIndex === 0;

    const isComplete = updatedPlayers.every((player) =>
      ALL_CATEGORIES.every((cat) => {
        const s = player.scoreCard[cat];
        return typeof s === 'number';
      }),
    );

    const newDiceSet = rollDice(createDiceSet());

    const newRound = isComplete
      ? this.gameState.round
      : isNewRound
        ? this.gameState.round + 1
        : this.gameState.round;

    this.gameState = {
      ...this.gameState,
      players: updatedPlayers,
      currentPlayerIndex: isComplete ? this.gameState.currentPlayerIndex : nextIndex,
      round: newRound,
      diceSet: isComplete ? this.gameState.diceSet : newDiceSet,
      phase: isComplete ? 'finished' as GamePhase : 'rolling' as GamePhase,
      updatedAt: Date.now(),
    };

    return {
      success: true,
      message: `${category}에 ${score}점을 기록했습니다.`,
      gameState: this.gameState,
    };
  }
}
