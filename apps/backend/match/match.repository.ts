import { GameState } from '@/libs';

export class MatchRepository {
  private matches = new Map<string, GameState>();

  save(state: GameState): GameState {
    this.matches.set(state.gameId, state);
    return state;
  }

  findById(id: string): GameState | null {
    return this.matches.get(id) ?? null;
  }
}
