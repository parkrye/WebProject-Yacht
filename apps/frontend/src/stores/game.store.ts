import { create } from 'zustand';
import type { GameState, ScoreCategory } from '../types/game.types';
import { firebaseService } from '../services/firebase.service';
import { GameEngine } from '../services/game-engine';
import { getRandomBotName, isBot, decideDiceToKeep, chooseBestCategory, delay } from '../services/ai-bot.service';

const STORAGE_KEY_PLAYER_ID = 'yacht_player_id';
const STORAGE_KEY_GAME_ID = 'yacht_game_id';

function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function saveToStorage(playerId: string, gameId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_ID, playerId);
    localStorage.setItem(STORAGE_KEY_GAME_ID, gameId);
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
}

function getFromStorage(): { playerId: string | null; gameId: string | null } {
  try {
    return {
      playerId: localStorage.getItem(STORAGE_KEY_PLAYER_ID),
      gameId: localStorage.getItem(STORAGE_KEY_GAME_ID),
    };
  } catch (e) {
    console.warn('localStorage not available:', e);
    return { playerId: null, gameId: null };
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PLAYER_ID);
    localStorage.removeItem(STORAGE_KEY_GAME_ID);
  } catch (e) {
    console.warn('localStorage not available:', e);
  }
}

interface GameStore {
  gameState: GameState | null;
  currentPlayerId: string | null;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  isAiTurnInProgress: boolean;

  setGameState: (state: GameState) => void;
  setCurrentPlayerId: (playerId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  createGame: (playerName: string) => Promise<void>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  addBot: () => Promise<void>;
  startGame: () => Promise<void>;
  rollDice: () => Promise<void>;
  toggleKeep: (index: number) => Promise<void>;
  selectScore: (category: ScoreCategory) => Promise<void>;
  refreshGame: () => Promise<void>;
  subscribeToGame: (gameId: string) => void;
  cleanup: () => void;
  playAiTurn: () => Promise<void>;
  leaveGame: () => Promise<void>;
  restartGame: () => Promise<void>;
  isHost: () => boolean;
  isMyTurn: () => boolean;
  restoreSession: () => Promise<boolean>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  currentPlayerId: null,
  isLoading: false,
  error: null,
  unsubscribe: null,
  isAiTurnInProgress: false,

  setGameState: (state) => set({ gameState: state }),
  setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  createGame: async (playerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const gameId = generateGameCode();
      const playerId = generatePlayerId();
      const engine = new GameEngine(gameId, playerId);

      // Add the creator as the first player (and host)
      engine.addPlayer(playerId, playerName);

      const state = engine.getState();
      await firebaseService.saveGame(state);

      // Save to localStorage for session persistence
      saveToStorage(playerId, gameId);

      set({ gameState: state, currentPlayerId: playerId });

      // Subscribe to real-time updates
      get().subscribeToGame(gameId);
    } catch (err) {
      console.error('Create game error:', err);
      set({ error: '게임 생성에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  joinGame: async (gameId: string, playerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const existingState = await firebaseService.getGame(gameId);
      if (!existingState) {
        set({ error: '게임을 찾을 수 없습니다.' });
        return;
      }

      const playerId = generatePlayerId();
      const engine = new GameEngine(gameId);
      engine.setState(existingState);

      const success = engine.addPlayer(playerId, playerName);
      if (!success) {
        set({ error: '게임에 참가할 수 없습니다.' });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);

      // Save to localStorage for session persistence
      saveToStorage(playerId, gameId);

      set({ gameState: newState, currentPlayerId: playerId });

      // Subscribe to real-time updates
      get().subscribeToGame(gameId);
    } catch (err) {
      console.error('Join game error:', err);
      set({ error: '게임 참가에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  addBot: async () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;
    if (gameState.players.length >= 4) return;

    // 방장만 AI 추가 가능
    if (gameState.hostId !== myPlayerId) {
      console.log('[addBot] Not host:', { hostId: gameState.hostId, myPlayerId });
      set({ error: '방장만 AI를 추가할 수 있습니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const existingNames = gameState.players.map(p => p.name);
      const botName = getRandomBotName(existingNames);
      const botId = `bot_${Date.now()}`;

      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const success = engine.addPlayer(botId, botName);
      if (!success) {
        set({ error: 'AI를 추가할 수 없습니다.' });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });
    } catch (err) {
      console.error('Add bot error:', err);
      set({ error: 'AI 추가에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  startGame: async () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;

    // 방장만 게임 시작 가능
    if (gameState.hostId !== myPlayerId) {
      console.log('[startGame] Not host:', { hostId: gameState.hostId, myPlayerId });
      set({ error: '방장만 게임을 시작할 수 있습니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const success = engine.startGame();
      if (!success) {
        set({ error: '게임을 시작할 수 없습니다.' });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });

      // Check if first player is AI
      const firstPlayer = newState.players[newState.currentPlayerIndex];
      if (isBot(firstPlayer.id)) {
        setTimeout(() => get().playAiTurn(), 1000);
      }
    } catch (err) {
      console.error('Start game error:', err);
      set({ error: '게임 시작에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  rollDice: async () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;

    // 내 턴인지 확인
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== myPlayerId) {
      console.log('[rollDice] Not my turn:', { currentTurn: currentPlayer?.id, myPlayerId });
      set({ error: '당신의 차례가 아닙니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const result = engine.roll();
      if (!result.success) {
        set({ error: result.message });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });
    } catch (err) {
      console.error('Roll dice error:', err);
      set({ error: '주사위 굴리기에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleKeep: async (index: number) => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;

    // 내 턴인지 확인
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== myPlayerId) {
      return; // 조용히 무시
    }

    const newKeepStatus = [...gameState.diceSet.kept];
    newKeepStatus[index] = !newKeepStatus[index];

    set({ isLoading: true, error: null });
    try {
      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const success = engine.setDiceKeepStatus(newKeepStatus);
      if (!success) {
        set({ error: '주사위 유지 설정에 실패했습니다.' });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });
    } catch (err) {
      console.error('Toggle keep error:', err);
      set({ error: '주사위 유지 설정에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectScore: async (category: ScoreCategory) => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;

    // 내 턴인지 확인
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== myPlayerId) {
      console.log('[selectScore] Not my turn:', { currentTurn: currentPlayer?.id, myPlayerId });
      set({ error: '당신의 차례가 아닙니다.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const result = engine.selectScoreCategory(category);
      if (!result.success) {
        set({ error: result.message });
        return;
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });

      // Check if next player is AI
      if (newState.phase === 'rolling') {
        const nextPlayer = newState.players[newState.currentPlayerIndex];
        if (isBot(nextPlayer.id)) {
          setTimeout(() => get().playAiTurn(), 1000);
        }
      }
    } catch (err) {
      console.error('Select score error:', err);
      set({ error: '점수 선택에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshGame: async () => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const state = await firebaseService.getGame(gameState.id);
      if (state) {
        set({ gameState: state });
      }
    } catch (err) {
      console.error('Refresh game error:', err);
      set({ error: '게임 새로고침에 실패했습니다.' });
    }
  },

  subscribeToGame: (gameId: string) => {
    // Cleanup previous subscription
    const { unsubscribe: prevUnsubscribe } = get();
    if (prevUnsubscribe) {
      prevUnsubscribe();
    }

    const unsubscribe = firebaseService.subscribeToGame(gameId, (state) => {
      if (state) {
        // currentPlayerId가 없으면 localStorage에서 복구 시도
        const { currentPlayerId } = get();
        if (!currentPlayerId) {
          const stored = getFromStorage();
          if (stored.playerId) {
            set({ gameState: state, currentPlayerId: stored.playerId });
            return;
          }
        }

        set({ gameState: state });

        // Check if current player is AI and trigger their turn
        if (state.phase === 'rolling' && !get().isAiTurnInProgress) {
          const currentPlayer = state.players[state.currentPlayerIndex];
          if (isBot(currentPlayer.id)) {
            setTimeout(() => get().playAiTurn(), 1000);
          }
        }
      } else {
        // 게임이 삭제됨 - 정리
        clearStorage();
        set({ gameState: null, currentPlayerId: null });
      }
    });

    set({ unsubscribe });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    clearStorage();
    set({ gameState: null, currentPlayerId: null, unsubscribe: null });
  },

  playAiTurn: async () => {
    const { gameState, isAiTurnInProgress } = get();
    if (!gameState || isAiTurnInProgress) return;
    if (gameState.phase !== 'rolling') return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!isBot(currentPlayer.id)) return;

    set({ isAiTurnInProgress: true });

    try {
      let state = gameState;
      const engine = new GameEngine(state.id);

      // AI는 2~3번 굴림
      const rollCount = 2 + Math.floor(Math.random() * 2); // 2 or 3

      for (let i = state.diceSet.rollCount; i < rollCount && i < 3; i++) {
        await delay(800);

        // 유지할 주사위 결정
        if (i > 0) {
          const keepStatus = decideDiceToKeep(state.diceSet.values);
          engine.setState(state);
          engine.setDiceKeepStatus(keepStatus);
          state = engine.getState();
          await firebaseService.saveGame(state);
          set({ gameState: state });
          await delay(500);
        }

        // 주사위 굴리기
        engine.setState(state);
        const rollResult = engine.roll();
        if (!rollResult.success) break;

        state = engine.getState();
        await firebaseService.saveGame(state);
        set({ gameState: state });
      }

      await delay(1000);

      // 최적의 카테고리 선택
      const bestCategory = chooseBestCategory(state.diceSet.values, currentPlayer.scoreCard);

      engine.setState(state);
      const result = engine.selectScoreCategory(bestCategory);

      if (result.success) {
        const newState = engine.getState();
        await firebaseService.saveGame(newState);
        set({ gameState: newState });

        // Check if next player is also AI
        if (newState.phase === 'rolling') {
          const nextPlayer = newState.players[newState.currentPlayerIndex];
          if (isBot(nextPlayer.id)) {
            setTimeout(() => get().playAiTurn(), 1500);
          }
        }
      }
    } catch (err) {
      console.error('AI turn error:', err);
    } finally {
      set({ isAiTurnInProgress: false });
    }
  },

  leaveGame: async () => {
    const { gameState, currentPlayerId, cleanup } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;

    set({ isLoading: true, error: null });
    try {
      const isCurrentHost = gameState.hostId === myPlayerId;

      if (isCurrentHost) {
        // 방장이 나가면 게임 삭제 (Firebase에서 제거)
        await firebaseService.deleteGame(gameState.id);
      }
      // 일반 플레이어는 그냥 로컬에서 나가기만 함

      cleanup();
    } catch (err) {
      console.error('Leave game error:', err);
      // 에러가 나도 일단 로컬 상태는 정리
      cleanup();
    } finally {
      set({ isLoading: false });
    }
  },

  restartGame: async () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const myPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !myPlayerId) return;
    if (gameState.hostId !== myPlayerId) return; // 방장만 가능

    set({ isLoading: true, error: null });
    try {
      const engine = new GameEngine(gameState.id, gameState.hostId);

      // 기존 플레이어들 다시 추가 (점수 초기화)
      for (const player of gameState.players) {
        engine.addPlayer(player.id, player.name);
      }

      const newState = engine.getState();
      await firebaseService.saveGame(newState);
      set({ gameState: newState });
    } catch (err) {
      console.error('Restart game error:', err);
      set({ error: '게임 재시작에 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  isHost: () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const storedPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !storedPlayerId) return false;
    const result = gameState.hostId === storedPlayerId;
    console.log('[isHost]', { hostId: gameState.hostId, storedPlayerId, result });
    return result;
  },

  isMyTurn: () => {
    const { gameState, currentPlayerId } = get();
    // localStorage에서 playerId 확인 (백업)
    const storedPlayerId = currentPlayerId || getFromStorage().playerId;
    if (!gameState || !storedPlayerId) return false;
    if (gameState.phase !== 'rolling') return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const result = currentPlayer?.id === storedPlayerId;
    console.log('[isMyTurn]', { currentTurnPlayerId: currentPlayer?.id, storedPlayerId, result });
    return result;
  },

  restoreSession: async () => {
    const { playerId, gameId } = getFromStorage();
    if (!playerId || !gameId) {
      return false;
    }

    try {
      const existingState = await firebaseService.getGame(gameId);
      if (!existingState) {
        // 게임이 더 이상 존재하지 않음 - 스토리지 정리
        clearStorage();
        return false;
      }

      // 내가 해당 게임의 플레이어인지 확인
      const isPlayerInGame = existingState.players.some(p => p.id === playerId);
      if (!isPlayerInGame) {
        // 내가 이 게임의 플레이어가 아님 - 스토리지 정리
        clearStorage();
        return false;
      }

      // 세션 복구 성공
      set({ gameState: existingState, currentPlayerId: playerId });
      get().subscribeToGame(gameId);
      return true;
    } catch (err) {
      console.error('Restore session error:', err);
      clearStorage();
      return false;
    }
  },
}));
