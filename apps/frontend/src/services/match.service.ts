import { api } from './api';
import { GameState, Player, Category } from '@/libs';

export const matchService = {
  create(gameId: string, players: Player[]) {
    return api.post<GameState>('/match', { gameId, players }).then(res => res.data);
  },

  get(gameId: string) {
    return api.get<GameState>(`/match/${gameId}`).then(res => res.data);
  },

  roll(gameId: string, playerId: string, keep: number[]) {
    return api.patch<GameState>(`/match/${gameId}/roll`, { playerId, keep }).then(res => res.data);
  },

  select(gameId: string, playerId: string, category: Category) {
    return api.patch<GameState>(`/match/${gameId}/category`, { playerId, category }).then(res => res.data);
  },
};
