import { GameState, GamePhase, Player } from '../types';
import { createDiceSet } from './dice-set.entity';

export function createGameState(id: string): GameState {
  const now = Date.now();

  return {
    id,
    players: [],
    currentPlayerIndex: 0,
    diceSet: createDiceSet(),
    phase: GamePhase.WAITING,
    round: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function addPlayerToGame(
  gameState: GameState,
  player: Player,
): GameState {
  return {
    ...gameState,
    players: [...gameState.players, player],
    updatedAt: Date.now(),
  };
}

export function getCurrentPlayer(gameState: GameState): Player | null {
  if (gameState.players.length === 0) {
    return null;
  }

  return gameState.players[gameState.currentPlayerIndex];
}

export function moveToNextPlayer(gameState: GameState): GameState {
  const nextIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.length;
  const isNewRound = nextIndex === 0;

  return {
    ...gameState,
    currentPlayerIndex: nextIndex,
    round: isNewRound ? gameState.round + 1 : gameState.round,
    updatedAt: Date.now(),
  };
}

export function isGameComplete(gameState: GameState): boolean {
  return gameState.players.every((player) =>
    Object.values(player.scoreCard).every((score) => score !== null),
  );
}
