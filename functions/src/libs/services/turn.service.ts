import { GameState, GamePhase, ScoreCategory } from '../types';
import { resetDiceSet, moveToNextPlayer, isGameComplete } from '../entities';
import { rollDice } from './dice.service';
import { calculateScore } from './score-calculator.service';

export interface TurnResult {
  success: boolean;
  message: string;
  gameState: GameState;
}

export function startTurn(gameState: GameState): TurnResult {
  if (gameState.phase !== GamePhase.WAITING && gameState.phase !== GamePhase.SCORING) {
    return {
      success: false,
      message: '현재 턴을 시작할 수 없는 상태입니다.',
      gameState,
    };
  }

  const newDiceSet = resetDiceSet(gameState.diceSet);
  const rolledDiceSet = rollDice(newDiceSet);

  return {
    success: true,
    message: '턴이 시작되었습니다.',
    gameState: {
      ...gameState,
      diceSet: rolledDiceSet,
      phase: GamePhase.ROLLING,
      updatedAt: Date.now(),
    },
  };
}

export function performRoll(gameState: GameState): TurnResult {
  if (gameState.phase !== GamePhase.ROLLING) {
    return {
      success: false,
      message: '주사위를 굴릴 수 없는 상태입니다.',
      gameState,
    };
  }

  const newDiceSet = rollDice(gameState.diceSet);

  if (newDiceSet === gameState.diceSet) {
    return {
      success: false,
      message: '더 이상 주사위를 굴릴 수 없습니다.',
      gameState,
    };
  }

  return {
    success: true,
    message: `주사위를 굴렸습니다. (${newDiceSet.rollCount}/3)`,
    gameState: {
      ...gameState,
      diceSet: newDiceSet,
      updatedAt: Date.now(),
    },
  };
}

export function selectCategory(
  gameState: GameState,
  category: ScoreCategory,
): TurnResult {
  if (gameState.phase !== GamePhase.ROLLING) {
    return {
      success: false,
      message: '점수를 선택할 수 없는 상태입니다.',
      gameState,
    };
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (currentPlayer.scoreCard[category] !== null) {
    return {
      success: false,
      message: '이미 선택된 카테고리입니다.',
      gameState,
    };
  }

  const score = calculateScore(category, gameState.diceSet.values);

  const updatedPlayers = gameState.players.map((player, index) => {
    if (index !== gameState.currentPlayerIndex) {
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

  let updatedGameState: GameState = {
    ...gameState,
    players: updatedPlayers,
    phase: GamePhase.SCORING,
    updatedAt: Date.now(),
  };

  updatedGameState = moveToNextPlayer(updatedGameState);

  if (isGameComplete(updatedGameState)) {
    updatedGameState = {
      ...updatedGameState,
      phase: GamePhase.FINISHED,
    };
  }

  return {
    success: true,
    message: `${category}에 ${score}점을 기록했습니다.`,
    gameState: updatedGameState,
  };
}
