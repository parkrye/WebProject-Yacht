import { create } from 'zustand';
import { GameState } from '@/libs';

type GameStore = {
  current: GameState | null;
  set: (s: GameState) => void;
  clear: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  current: null,
  set: (s) => set({ current: s }),
  clear: () => set({ current: null }),
}));
