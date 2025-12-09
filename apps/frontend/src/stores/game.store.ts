import { create } from 'zustand';
import type { GameState, ScoreCategory } from '../types/game.types';
import { gameApi } from '../services/api.service';

interface GameStore {
  gameState: GameState | null;
  currentPlayerId: string | null;
  isLoading: boolean;
  error: string | null;

  setGameState: (state: GameState) => void;
  setCurrentPlayerId: (playerId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  createGame: () => Promise<void>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  rollDice: () => Promise<void>;
  toggleKeep: (index: number) => Promise<void>;
  selectScore: (category: ScoreCategory) => Promise<void>;
  refreshGame: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  currentPlayerId: null,
  isLoading: false,
  error: null,

  setGameState: (state) => set({ gameState: state }),
  setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  createGame: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = await gameApi.createGame();
      set({ gameState: state });
    } catch {
      set({ error: '게임 생성에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  joinGame: async (gameId: string, playerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const playerId = `player_${Date.now()}`;
      const state = await gameApi.joinGame(gameId, playerId, playerName);
      set({ gameState: state, currentPlayerId: playerId });
    } catch {
      set({ error: '게임 참가에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  startGame: async () => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const state = await gameApi.startGame(gameState.id);
      set({ gameState: state });
    } catch {
      set({ error: '게임 시작에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  rollDice: async () => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const state = await gameApi.rollDice(gameState.id);
      set({ gameState: state });
    } catch {
      set({ error: '주사위 굴리기에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleKeep: async (index: number) => {
    const { gameState } = get();
    if (!gameState) return;

    const newKeepStatus = [...gameState.diceSet.kept];
    newKeepStatus[index] = !newKeepStatus[index];

    set({ isLoading: true, error: null });
    try {
      const state = await gameApi.setKeepStatus(gameState.id, newKeepStatus);
      set({ gameState: state });
    } catch {
      set({ error: '주사위 유지 설정에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectScore: async (category: ScoreCategory) => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const state = await gameApi.selectScore(gameState.id, category);
      set({ gameState: state });
    } catch {
      set({ error: '점수 선택에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshGame: async () => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const state = await gameApi.getGame(gameState.id);
      set({ gameState: state });
    } catch {
      set({ error: '게임 새로고침에 실패했습니다.' });
    }
  },
}));
