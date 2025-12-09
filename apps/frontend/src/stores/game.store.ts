import { create } from 'zustand';
import type { GameState, ScoreCategory } from '../types/game.types';
import { firebaseService } from '../services/firebase.service';
import { GameEngine } from '../services/game-engine';
import {
  getRandomBot,
  isBot,
  decideDiceToKeep,
  chooseBestCategory,
  shouldRollAgain,
  delay,
  registerBotParams,
  getBotParams,
  calculateThinkingTime,
  shouldAISendChat,
  chooseAIChatMessage,
} from '../services/ai-bot.service';
import type { AIChatContext } from '../services/ai-bot.service';

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
      const bot = getRandomBot(existingNames);
      const botId = `bot_${Date.now()}`;

      // AI 파라미터 등록
      registerBotParams(botId, bot.params);
      console.log(`[addBot] ${bot.name} 추가됨:`, bot.params);

      const engine = new GameEngine(gameState.id);
      engine.setState(gameState);

      const success = engine.addPlayer(botId, bot.name);
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

    // AI 채팅 헬퍼 함수
    const sendAIChat = async (context: AIChatContext) => {
      const params = getBotParams(currentPlayer.id);
      if (shouldAISendChat(params, context)) {
        const message = chooseAIChatMessage(params, context);
        await firebaseService.sendChatMessage(gameState.id, {
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          message,
          timestamp: Date.now(),
        });
      }
    };

    try {
      let state = gameState;
      const engine = new GameEngine(state.id);

      // AI 파라미터 가져오기
      const params = getBotParams(currentPlayer.id);
      console.log(`[AI Turn] ${currentPlayer.name} 파라미터:`, params);

      // 턴 시작 시 채팅
      await sendAIChat('turnStart');

      // 첫 굴림 전 신중함에 따른 대기
      await delay(calculateThinkingTime(params.caution));

      // 첫 굴림
      engine.setState(state);
      const firstRoll = engine.roll();
      if (!firstRoll.success) {
        set({ isAiTurnInProgress: false });
        return;
      }
      state = engine.getState();
      await firebaseService.saveGame(state);
      set({ gameState: state });

      // 첫 굴림 결과에 따른 채팅
      const firstRollSum = state.diceSet.values.reduce((a, b) => a + b, 0);
      const isGoodRoll = firstRollSum >= 20 || state.diceSet.values.every(v => v === state.diceSet.values[0]);
      if (isGoodRoll) {
        await sendAIChat('goodRoll');
      } else if (firstRollSum <= 12) {
        await sendAIChat('badRoll');
      }

      // 추가 굴림 여부 결정 (파라미터 기반)
      while (shouldRollAgain(state.diceSet.values, state.diceSet.rollCount, currentPlayer.scoreCard, params)) {
        // 신중함에 따른 대기
        await delay(calculateThinkingTime(params.caution));

        // 유지할 주사위 결정 (파라미터 + 스코어카드 적용)
        const keepStatus = decideDiceToKeep(state.diceSet.values, params, currentPlayer.scoreCard);
        engine.setState(state);
        engine.setDiceKeepStatus(keepStatus);
        state = engine.getState();
        await firebaseService.saveGame(state);
        set({ gameState: state });

        // 킵 결정 후 잠시 대기
        await delay(calculateThinkingTime(params.caution) * 0.5);

        // 주사위 굴리기
        engine.setState(state);
        const rollResult = engine.roll();
        if (!rollResult.success) break;

        state = engine.getState();
        await firebaseService.saveGame(state);
        set({ gameState: state });

        // 추가 굴림 결과에 따른 채팅 (야찌 등 특별한 경우)
        if (state.diceSet.values.every(v => v === state.diceSet.values[0])) {
          await sendAIChat('goodRoll');
        }
      }

      // 카테고리 선택 전 신중함에 따른 대기
      await delay(calculateThinkingTime(params.caution));

      // 최적의 카테고리 선택 (파라미터 적용)
      const bestCategory = chooseBestCategory(state.diceSet.values, currentPlayer.scoreCard, params);
      console.log(`[AI] ${currentPlayer.name} 선택: ${bestCategory}`);

      engine.setState(state);
      const result = engine.selectScoreCategory(bestCategory);

      if (result.success) {
        const newState = engine.getState();
        await firebaseService.saveGame(newState);
        set({ gameState: newState });

        // 점수 선택 후 채팅
        await sendAIChat('scoreSelect');

        // Check if next player is also AI
        if (newState.phase === 'rolling') {
          const nextPlayer = newState.players[newState.currentPlayerIndex];
          if (isBot(nextPlayer.id)) {
            // 다음 AI 플레이어도 신중함에 따라 대기
            const nextParams = getBotParams(nextPlayer.id);
            setTimeout(() => get().playAiTurn(), calculateThinkingTime(nextParams.caution));
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
      // 나를 제외한 실제 플레이어(봇 아닌) 수 계산
      const realPlayersAfterLeave = gameState.players.filter(
        p => p.id !== myPlayerId && !p.id.startsWith('bot_')
      ).length;

      if (realPlayersAfterLeave === 0) {
        // 실제 플레이어가 없으면 방 삭제
        console.log('[leaveGame] 실제 플레이어가 없어 방 삭제:', gameState.id);
        await firebaseService.deleteGame(gameState.id);
      } else {
        // 게임 진행 중인지 확인
        const isGameInProgress = gameState.phase === 'rolling' || gameState.phase === 'scoring';

        // 나의 현재 정보 찾기
        const myPlayer = gameState.players.find(p => p.id === myPlayerId);
        const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId);

        let updatedPlayers = gameState.players;
        let newHostId = gameState.hostId;

        if (isGameInProgress && myPlayer) {
          // 게임 진행 중: 나를 AI로 대체
          const botId = `bot_${Date.now()}`;
          const botName = `${myPlayer.name} (AI)`;

          // AI 파라미터 등록 (기본값)
          const defaultBotParams = { aggression: 5, caution: 5, mistake: 2 };
          registerBotParams(botId, defaultBotParams);
          console.log(`[leaveGame] ${myPlayer.name} -> AI로 대체:`, botId);

          updatedPlayers = gameState.players.map(p => {
            if (p.id === myPlayerId) {
              return {
                ...p,
                id: botId,
                name: botName,
              };
            }
            return p;
          });

          // 현재 내 차례였다면 AI가 바로 플레이하도록
          const wasMyTurn = gameState.currentPlayerIndex === myPlayerIndex;

          // 방장이 나가는 경우 다음 실제 플레이어에게 방장 이전
          if (gameState.hostId === myPlayerId) {
            const nextRealPlayer = updatedPlayers.find(p => !p.id.startsWith('bot_'));
            if (nextRealPlayer) {
              newHostId = nextRealPlayer.id;
              console.log('[leaveGame] 방장 이전:', newHostId);
            }
          }

          const updatedState: GameState = {
            ...gameState,
            players: updatedPlayers,
            hostId: newHostId,
          };

          await firebaseService.saveGame(updatedState);

          // 내 차례였다면 AI 턴 트리거 (다른 클라이언트에서 처리됨)
          if (wasMyTurn) {
            console.log('[leaveGame] 내 차례였음 - AI가 이어서 플레이');
          }
        } else {
          // 대기 중: 플레이어 목록에서 제거
          updatedPlayers = gameState.players.filter(p => p.id !== myPlayerId);

          // 방장이 나가는 경우 다음 실제 플레이어에게 방장 이전
          if (gameState.hostId === myPlayerId) {
            const nextRealPlayer = updatedPlayers.find(p => !p.id.startsWith('bot_'));
            if (nextRealPlayer) {
              newHostId = nextRealPlayer.id;
              console.log('[leaveGame] 방장 이전:', newHostId);
            }
          }

          const updatedState: GameState = {
            ...gameState,
            players: updatedPlayers,
            hostId: newHostId,
          };

          await firebaseService.saveGame(updatedState);
        }
      }

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
