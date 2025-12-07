import { Injectable } from '@nestjs/common';
import { MatchRepository } from './match.repository';
import { Player, GameEngine, GameState, Category } from '@/libs';
import { ResourceNotFoundException } from '../common';

@Injectable()
export class MatchService {
  private readonly engine = new GameEngine();

  constructor(private readonly repo: MatchRepository) {}

  createMatch(gameId: string, players: Player[]): GameState {
    const state = this.engine.create(gameId, players);
    return this.repo.save(state);
  }

  roll(gameId: string, playerId: string, keep: number[]): GameState {
    const state = this.requireState(gameId);
    const updated = this.engine.roll(state, playerId, keep);
    return this.repo.save(updated);
  }

  selectCategory(gameId: string, playerId: string, category: Category): GameState {
    const state = this.requireState(gameId);
    const updated = this.engine.selectCategory(state, playerId, category);
    return this.repo.save(updated);
  }

  getState(gameId: string): GameState {
    return this.requireState(gameId);
  }

  private requireState(id: string): GameState {
    const state = this.repo.findById(id);
    if (!state) throw new ResourceNotFoundException('Match');
    return state;
  }
}
