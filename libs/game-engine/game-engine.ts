import {
  GameState,
  GamePhase,
  Player,
  ScoreCategory,
} from '../types';
import {
  createGameState,
  addPlayerToGame,
  getCurrentPlayer,
  createPlayer,
  toggleKeep,
  setKeepStatus,
  getTotalScore,
} from '../entities';
import {
  startTurn,
  performRoll,
  selectCategory,
  TurnResult,
  calculateAllPossibleScores,
} from '../services';
import { GAME_CONSTANTS } from '../constants';

export class GameEngine {
  private gameState: GameState;

  constructor(gameId: string) {
    this.gameState = createGameState(gameId);
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

    const existingPlayer = this.gameState.players.find(
      (p) => p.id === playerId,
    );
    if (existingPlayer) {
      return false;
    }

    const player = createPlayer(playerId, playerName);
    this.gameState = addPlayerToGame(this.gameState, player);
    return true;
  }

  startGame(): boolean {
    if (this.gameState.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      return false;
    }

    if (this.gameState.phase !== GamePhase.WAITING) {
      return false;
    }

    const result = startTurn(this.gameState);
    if (result.success) {
      this.gameState = result.gameState;
    }
    return result.success;
  }

  roll(): TurnResult {
    const result = performRoll(this.gameState);
    if (result.success) {
      this.gameState = result.gameState;
    }
    return result;
  }

  toggleDiceKeep(index: number): boolean {
    if (this.gameState.phase !== GamePhase.ROLLING) {
      return false;
    }

    this.gameState = {
      ...this.gameState,
      diceSet: toggleKeep(this.gameState.diceSet, index),
      updatedAt: Date.now(),
    };
    return true;
  }

  setDiceKeepStatus(keepStatus: boolean[]): boolean {
    if (this.gameState.phase !== GamePhase.ROLLING) {
      return false;
    }

    this.gameState = {
      ...this.gameState,
      diceSet: setKeepStatus(this.gameState.diceSet, keepStatus),
      updatedAt: Date.now(),
    };
    return true;
  }

  selectScoreCategory(category: ScoreCategory): TurnResult {
    const result = selectCategory(this.gameState, category);
    if (result.success) {
      this.gameState = result.gameState;

      if (this.gameState.phase !== GamePhase.FINISHED) {
        const turnResult = startTurn(this.gameState);
        if (turnResult.success) {
          this.gameState = turnResult.gameState;
        }
      }
    }
    return result;
  }

  getCurrentPlayer(): Player | null {
    return getCurrentPlayer(this.gameState);
  }

  getPossibleScores(): Map<ScoreCategory, number> {
    return calculateAllPossibleScores(this.gameState.diceSet.values);
  }

  getPlayerScores(): { player: Player; total: number }[] {
    return this.gameState.players.map((player) => ({
      player,
      total: getTotalScore(player.scoreCard),
    }));
  }

  getWinner(): Player | null {
    if (this.gameState.phase !== GamePhase.FINISHED) {
      return null;
    }

    const scores = this.getPlayerScores();
    if (scores.length === 0) {
      return null;
    }

    const maxScore = Math.max(...scores.map((s) => s.total));
    const winner = scores.find((s) => s.total === maxScore);
    return winner?.player ?? null;
  }

  isGameOver(): boolean {
    return this.gameState.phase === GamePhase.FINISHED;
  }
}
