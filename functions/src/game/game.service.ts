import { Injectable } from '@nestjs/common';
import { GameRepository, GameState } from './game.repository';
import { GameEngine, ScoreCategory } from './game-engine';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
  private gameEngines: Map<string, GameEngine> = new Map();

  constructor(private readonly gameRepository: GameRepository) {}

  private getOrCreateEngine(gameId: string): GameEngine {
    let engine = this.gameEngines.get(gameId);
    if (!engine) {
      engine = new GameEngine(gameId);
      this.gameEngines.set(gameId, engine);
    }
    return engine;
  }

  async createGame(): Promise<GameState> {
    const gameId = uuidv4();
    const engine = this.getOrCreateEngine(gameId);
    const state = engine.getState();

    await this.gameRepository.save(state);
    return state;
  }

  async getGame(gameId: string): Promise<GameState | null> {
    const state = await this.gameRepository.findById(gameId);

    if (state) {
      const engine = this.getOrCreateEngine(gameId);
      engine.setState(state);
    }

    return state;
  }

  async joinGame(
    gameId: string,
    playerId: string,
    playerName: string,
  ): Promise<GameState | null> {
    const state = await this.getGame(gameId);
    if (!state) {
      return null;
    }

    const engine = this.getOrCreateEngine(gameId);
    engine.setState(state);

    const success = engine.addPlayer(playerId, playerName);
    if (!success) {
      return null;
    }

    const newState = engine.getState();
    await this.gameRepository.save(newState);
    return newState;
  }

  async startGame(gameId: string): Promise<GameState | null> {
    const state = await this.getGame(gameId);
    if (!state) {
      return null;
    }

    const engine = this.getOrCreateEngine(gameId);
    engine.setState(state);

    const success = engine.startGame();
    if (!success) {
      return null;
    }

    const newState = engine.getState();
    await this.gameRepository.save(newState);
    return newState;
  }

  async rollDice(gameId: string): Promise<GameState | null> {
    const state = await this.getGame(gameId);
    if (!state) {
      return null;
    }

    const engine = this.getOrCreateEngine(gameId);
    engine.setState(state);

    const result = engine.roll();
    if (!result.success) {
      return null;
    }

    const newState = engine.getState();
    await this.gameRepository.save(newState);
    return newState;
  }

  async setKeepStatus(
    gameId: string,
    keepStatus: boolean[],
  ): Promise<GameState | null> {
    const state = await this.getGame(gameId);
    if (!state) {
      return null;
    }

    const engine = this.getOrCreateEngine(gameId);
    engine.setState(state);

    const success = engine.setDiceKeepStatus(keepStatus);
    if (!success) {
      return null;
    }

    const newState = engine.getState();
    await this.gameRepository.save(newState);
    return newState;
  }

  async selectScore(
    gameId: string,
    category: ScoreCategory,
  ): Promise<GameState | null> {
    const state = await this.getGame(gameId);
    if (!state) {
      console.log('[selectScore] Game not found:', gameId);
      return null;
    }

    console.log('[selectScore] Current state:', {
      phase: state.phase,
      round: state.round,
      currentPlayerIndex: state.currentPlayerIndex,
      rollCount: state.diceSet.rollCount,
      category,
      scoreCard: state.players[state.currentPlayerIndex]?.scoreCard,
    });

    const engine = this.getOrCreateEngine(gameId);
    engine.setState(state);

    const result = engine.selectScoreCategory(category);
    console.log('[selectScore] Result:', {
      success: result.success,
      message: result.message,
    });

    if (!result.success) {
      return null;
    }

    const newState = engine.getState();
    console.log('[selectScore] New state:', {
      phase: newState.phase,
      round: newState.round,
      currentPlayerIndex: newState.currentPlayerIndex,
      rollCount: newState.diceSet.rollCount,
    });

    await this.gameRepository.save(newState);
    return newState;
  }

  cleanupEngine(gameId: string): void {
    this.gameEngines.delete(gameId);
  }
}
