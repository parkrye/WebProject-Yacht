import { ref, set, get, update, onValue, off } from 'firebase/database';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  diceSet: DiceSet;
  phase: GamePhase;
  round: number;
  createdAt: number;
  updatedAt: number;
}

export enum GamePhase {
  WAITING = 'waiting',
  ROLLING = 'rolling',
  SCORING = 'scoring',
  FINISHED = 'finished',
}

export interface DiceSet {
  values: number[];
  kept: boolean[];
  rollCount: number;
}

export interface Player {
  id: string;
  name: string;
  scoreCard: Record<string, number | null>;
}

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

@Injectable()
export class GameRepository {
  private database: Database;

  constructor(private configService: ConfigService) {
    this.database = this.initializeFirebase();
  }

  private initializeFirebase(): Database {
    if (database) {
      return database;
    }

    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      const firebaseConfig = {
        apiKey: this.configService.get<string>('FIREBASE_API_KEY'),
        authDomain: this.configService.get<string>('FIREBASE_AUTH_DOMAIN'),
        databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: this.configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
        appId: this.configService.get<string>('FIREBASE_APP_ID'),
      };
      firebaseApp = initializeApp(firebaseConfig);
    }

    database = getDatabase(firebaseApp);
    return database;
  }

  private getGameRef(gameId: string) {
    return ref(this.database, `games/${gameId}`);
  }

  async save(gameState: GameState): Promise<void> {
    const gameRef = this.getGameRef(gameState.id);
    await set(gameRef, gameState);
  }

  async findById(gameId: string): Promise<GameState | null> {
    const gameRef = this.getGameRef(gameId);
    const snapshot = await get(gameRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.val();
    // Firebase는 빈 배열과 null 값을 저장하지 않으므로 기본값 설정
    const players = (data.players || []).map((player: Player) => ({
      ...player,
      scoreCard: player.scoreCard || this.createEmptyScoreCard(),
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
  }

  private createEmptyScoreCard(): Record<string, number | null> {
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

  async update(gameId: string, updates: Partial<GameState>): Promise<void> {
    const gameRef = this.getGameRef(gameId);
    await update(gameRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  subscribeToGame(
    gameId: string,
    callback: (gameState: GameState | null) => void,
  ): () => void {
    const gameRef = this.getGameRef(gameId);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as GameState);
      } else {
        callback(null);
      }
    });

    return () => off(gameRef);
  }

  async delete(gameId: string): Promise<void> {
    const gameRef = this.getGameRef(gameId);
    await set(gameRef, null);
  }
}
