import { GameState, GamePhase, Player, DiceSet } from './game.repository';

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
};

export enum ScoreCategory {
  ONES = 'ones',
  TWOS = 'twos',
  THREES = 'threes',
  FOURS = 'fours',
  FIVES = 'fives',
  SIXES = 'sixes',
  THREE_OF_A_KIND = 'threeOfAKind',
  FOUR_OF_A_KIND = 'fourOfAKind',
  FULL_HOUSE = 'fullHouse',
  SMALL_STRAIGHT = 'smallStraight',
  LARGE_STRAIGHT = 'largeStraight',
  CHOICE = 'choice',
  YACHT = 'yacht',
}

function createEmptyScoreCard(): Record<string, number | null> {
  return {
    [ScoreCategory.ONES]: null,
    [ScoreCategory.TWOS]: null,
    [ScoreCategory.THREES]: null,
    [ScoreCategory.FOURS]: null,
    [ScoreCategory.FIVES]: null,
    [ScoreCategory.SIXES]: null,
    [ScoreCategory.THREE_OF_A_KIND]: null,
    [ScoreCategory.FOUR_OF_A_KIND]: null,
    [ScoreCategory.FULL_HOUSE]: null,
    [ScoreCategory.SMALL_STRAIGHT]: null,
    [ScoreCategory.LARGE_STRAIGHT]: null,
    [ScoreCategory.CHOICE]: null,
    [ScoreCategory.YACHT]: null,
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

function calculateScore(category: ScoreCategory, diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);
  const sorted = [...diceValues].sort((a, b) => a - b);
  const unique = [...new Set(sorted)];
  const sum = diceValues.reduce((s, v) => s + v, 0);

  switch (category) {
    case ScoreCategory.ONES:
      return diceValues.filter((v) => v === 1).length * 1;
    case ScoreCategory.TWOS:
      return diceValues.filter((v) => v === 2).length * 2;
    case ScoreCategory.THREES:
      return diceValues.filter((v) => v === 3).length * 3;
    case ScoreCategory.FOURS:
      return diceValues.filter((v) => v === 4).length * 4;
    case ScoreCategory.FIVES:
      return diceValues.filter((v) => v === 5).length * 5;
    case ScoreCategory.SIXES:
      return diceValues.filter((v) => v === 6).length * 6;
    case ScoreCategory.THREE_OF_A_KIND:
      for (const [value, count] of counts.entries()) {
        if (count >= 3) return value * 3;
      }
      return 0;
    case ScoreCategory.FOUR_OF_A_KIND:
      for (const [value, count] of counts.entries()) {
        if (count >= 4) return value * 4;
      }
      return 0;
    case ScoreCategory.FULL_HOUSE:
      const countValues = Array.from(counts.values());
      if (
        (countValues.includes(3) && countValues.includes(2)) ||
        countValues.includes(5)
      ) {
        return sum;
      }
      return 0;
    case ScoreCategory.SMALL_STRAIGHT:
      const smallStraights = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      for (const straight of smallStraights) {
        if (straight.every((v) => unique.includes(v))) {
          return straight.reduce((s, v) => s + v, 0);
        }
      }
      return 0;
    case ScoreCategory.LARGE_STRAIGHT:
      const largeStraights = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
      ];
      for (const straight of largeStraights) {
        if (straight.every((v) => unique.includes(v))) {
          return sum;
        }
      }
      return 0;
    case ScoreCategory.CHOICE:
      return sum;
    case ScoreCategory.YACHT:
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

export class GameEngine {
  private gameState: GameState;

  constructor(gameId: string) {
    const now = Date.now();
    this.gameState = {
      id: gameId,
      players: [],
      currentPlayerIndex: 0,
      diceSet: createDiceSet(),
      phase: GamePhase.WAITING,
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
    if (this.gameState.phase !== GamePhase.WAITING) {
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
    if (this.gameState.phase !== GamePhase.WAITING) {
      return false;
    }

    const newDiceSet = rollDice(createDiceSet());
    this.gameState = {
      ...this.gameState,
      diceSet: newDiceSet,
      phase: GamePhase.ROLLING,
      updatedAt: Date.now(),
    };
    return true;
  }

  roll(): TurnResult {
    if (this.gameState.phase !== GamePhase.ROLLING) {
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
    if (this.gameState.phase !== GamePhase.ROLLING) {
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
    if (this.gameState.phase !== GamePhase.ROLLING) {
      return {
        success: false,
        message: '점수를 선택할 수 없는 상태입니다.',
        gameState: this.gameState,
      };
    }

    const currentPlayer =
      this.gameState.players[this.gameState.currentPlayerIndex];
    if (currentPlayer.scoreCard[category] !== null) {
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
      Object.values(player.scoreCard).every((s) => s !== null),
    );

    const newDiceSet = rollDice(createDiceSet());

    this.gameState = {
      ...this.gameState,
      players: updatedPlayers,
      currentPlayerIndex: nextIndex,
      round: isNewRound ? this.gameState.round + 1 : this.gameState.round,
      diceSet: isComplete ? this.gameState.diceSet : newDiceSet,
      phase: isComplete ? GamePhase.FINISHED : GamePhase.ROLLING,
      updatedAt: Date.now(),
    };

    return {
      success: true,
      message: `${category}에 ${score}점을 기록했습니다.`,
      gameState: this.gameState,
    };
  }
}
