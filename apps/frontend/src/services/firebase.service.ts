import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set, get, remove, onValue, off } from 'firebase/database';
import type { GameState } from '../types/game.types';

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
};
