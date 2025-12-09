import type { GameState, ScoreCategory } from '../types/game.types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

export const gameApi = {
  createGame: () => fetchApi<GameState>('/game', { method: 'POST' }),

  getGame: (gameId: string) => fetchApi<GameState>(`/game/${gameId}`),

  joinGame: (gameId: string, playerId: string, playerName: string) =>
    fetchApi<GameState>(`/game/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerId, playerName }),
    }),

  startGame: (gameId: string) =>
    fetchApi<GameState>(`/game/${gameId}/start`, { method: 'POST' }),

  rollDice: (gameId: string) =>
    fetchApi<GameState>(`/game/${gameId}/roll`, { method: 'POST' }),

  setKeepStatus: (gameId: string, keepStatus: boolean[]) =>
    fetchApi<GameState>(`/game/${gameId}/keep`, {
      method: 'POST',
      body: JSON.stringify({ keepStatus }),
    }),

  selectScore: (gameId: string, category: ScoreCategory) =>
    fetchApi<GameState>(`/game/${gameId}/score`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),
};
