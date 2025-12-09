import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set, get, remove, onValue, off, push } from 'firebase/database';
import type { GameState } from '../types/game.types';
import type { ChatMessage } from '../components/chat';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
  } else {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

function getDb(): Database {
  if (database) return database;
  database = getDatabase(getFirebaseApp());
  return database;
}

function createEmptyScoreCard(): Record<string, number | null> {
  return {
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    threeOfAKind: null,
    fourOfAKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    choice: null,
    yacht: null,
  };
}

export const firebaseService = {
  async saveGame(gameState: GameState): Promise<void> {
    const db = getDb();
    const gameRef = ref(db, `games/${gameState.id}`);
    await set(gameRef, gameState);
  },

  async getGame(gameId: string): Promise<GameState | null> {
    const db = getDb();
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.val();
    const players = (data.players || []).map((player: GameState['players'][0]) => ({
      ...player,
      scoreCard: player.scoreCard || createEmptyScoreCard(),
    }));

    return {
      ...data,
      players,
      diceSet: {
        values: data.diceSet?.values || [0, 0, 0, 0, 0],
        kept: data.diceSet?.kept || [false, false, false, false, false],
        rollCount: data.diceSet?.rollCount ?? 0,
      },
    } as GameState;
  },

  subscribeToGame(
    gameId: string,
    callback: (gameState: GameState | null) => void,
  ): () => void {
    const db = getDb();
    const gameRef = ref(db, `games/${gameId}`);

    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const players = (data.players || []).map((player: GameState['players'][0]) => ({
          ...player,
          scoreCard: player.scoreCard || createEmptyScoreCard(),
        }));

        const gameState: GameState = {
          ...data,
          players,
          diceSet: {
            values: data.diceSet?.values || [0, 0, 0, 0, 0],
            kept: data.diceSet?.kept || [false, false, false, false, false],
            rollCount: data.diceSet?.rollCount ?? 0,
          },
        };
        callback(gameState);
      } else {
        callback(null);
      }
    });

    return () => off(gameRef);
  },

  async deleteGame(gameId: string): Promise<void> {
    const db = getDb();
    const gameRef = ref(db, `games/${gameId}`);
    await remove(gameRef);
  },

  // 대기 중인 방 목록 가져오기
  async getWaitingRooms(): Promise<GameState[]> {
    const db = getDb();
    const gamesRef = ref(db, 'games');
    const snapshot = await get(gamesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    const rooms: GameState[] = [];

    for (const gameId in data) {
      const gameData = data[gameId];
      // waiting 상태이고 플레이어가 4명 미만인 방만 표시
      if (gameData.phase === 'waiting' && (gameData.players?.length || 0) < 4) {
        const players = (gameData.players || []).map((player: GameState['players'][0]) => ({
          ...player,
          scoreCard: player.scoreCard || createEmptyScoreCard(),
        }));

        rooms.push({
          ...gameData,
          players,
          diceSet: {
            values: gameData.diceSet?.values || [0, 0, 0, 0, 0],
            kept: gameData.diceSet?.kept || [false, false, false, false, false],
            rollCount: gameData.diceSet?.rollCount ?? 0,
          },
        } as GameState);
      }
    }

    // 최신순 정렬
    rooms.sort((a, b) => b.createdAt - a.createdAt);
    return rooms;
  },

  // 방 목록 실시간 구독
  subscribeToRooms(callback: (rooms: GameState[]) => void): () => void {
    const db = getDb();
    const gamesRef = ref(db, 'games');

    onValue(gamesRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val();
      const rooms: GameState[] = [];

      for (const gameId in data) {
        const gameData = data[gameId];
        // waiting 상태이고 플레이어가 4명 미만인 방만 표시
        if (gameData.phase === 'waiting' && (gameData.players?.length || 0) < 4) {
          const players = (gameData.players || []).map((player: GameState['players'][0]) => ({
            ...player,
            scoreCard: player.scoreCard || createEmptyScoreCard(),
          }));

          rooms.push({
            ...gameData,
            players,
            diceSet: {
              values: gameData.diceSet?.values || [0, 0, 0, 0, 0],
              kept: gameData.diceSet?.kept || [false, false, false, false, false],
              rollCount: gameData.diceSet?.rollCount ?? 0,
            },
          } as GameState);
        }
      }

      // 최신순 정렬
      rooms.sort((a, b) => b.createdAt - a.createdAt);
      callback(rooms);
    });

    return () => off(gamesRef);
  },

  // 채팅 메시지 전송
  async sendChatMessage(gameId: string, message: Omit<ChatMessage, 'id'>): Promise<void> {
    const db = getDb();
    const chatRef = ref(db, `chats/${gameId}`);
    const newMessageRef = push(chatRef);
    await set(newMessageRef, {
      ...message,
      id: newMessageRef.key,
    });
  },

  // 채팅 메시지 구독
  subscribeToChatMessages(
    gameId: string,
    callback: (messages: ChatMessage[]) => void,
  ): () => void {
    const db = getDb();
    const chatRef = ref(db, `chats/${gameId}`);

    onValue(chatRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val();
      const messages: ChatMessage[] = Object.values(data);
      // 시간순 정렬
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    });

    return () => off(chatRef);
  },

  // 채팅 삭제 (게임 종료 시)
  async deleteChatMessages(gameId: string): Promise<void> {
    const db = getDb();
    const chatRef = ref(db, `chats/${gameId}`);
    await remove(chatRef);
  },
};
