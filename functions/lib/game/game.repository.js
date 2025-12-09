"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRepository = exports.GamePhase = void 0;
const database_1 = require("firebase/database");
const app_1 = require("firebase/app");
const database_2 = require("firebase/database");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var GamePhase;
(function (GamePhase) {
    GamePhase["WAITING"] = "waiting";
    GamePhase["ROLLING"] = "rolling";
    GamePhase["SCORING"] = "scoring";
    GamePhase["FINISHED"] = "finished";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
let firebaseApp = null;
let database = null;
let GameRepository = class GameRepository {
    constructor(configService) {
        this.configService = configService;
        this.database = this.initializeFirebase();
    }
    initializeFirebase() {
        if (database) {
            return database;
        }
        const existingApps = (0, app_1.getApps)();
        if (existingApps.length > 0) {
            firebaseApp = existingApps[0];
        }
        else {
            const firebaseConfig = {
                apiKey: this.configService.get('FIREBASE_API_KEY'),
                authDomain: this.configService.get('FIREBASE_AUTH_DOMAIN'),
                databaseURL: this.configService.get('FIREBASE_DATABASE_URL'),
                projectId: this.configService.get('FIREBASE_PROJECT_ID'),
                storageBucket: this.configService.get('FIREBASE_STORAGE_BUCKET'),
                messagingSenderId: this.configService.get('FIREBASE_MESSAGING_SENDER_ID'),
                appId: this.configService.get('FIREBASE_APP_ID'),
            };
            firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
        }
        database = (0, database_2.getDatabase)(firebaseApp);
        return database;
    }
    getGameRef(gameId) {
        return (0, database_1.ref)(this.database, `games/${gameId}`);
    }
    async save(gameState) {
        const gameRef = this.getGameRef(gameState.id);
        await (0, database_1.set)(gameRef, gameState);
    }
    async findById(gameId) {
        const gameRef = this.getGameRef(gameId);
        const snapshot = await (0, database_1.get)(gameRef);
        if (!snapshot.exists()) {
            return null;
        }
        const data = snapshot.val();
        // Firebase는 빈 배열과 null 값을 저장하지 않으므로 기본값 설정
        const players = (data.players || []).map((player) => ({
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
        };
    }
    createEmptyScoreCard() {
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
    async update(gameId, updates) {
        const gameRef = this.getGameRef(gameId);
        await (0, database_1.update)(gameRef, {
            ...updates,
            updatedAt: Date.now(),
        });
    }
    subscribeToGame(gameId, callback) {
        const gameRef = this.getGameRef(gameId);
        const unsubscribe = (0, database_1.onValue)(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            }
            else {
                callback(null);
            }
        });
        return () => (0, database_1.off)(gameRef);
    }
    async delete(gameId) {
        const gameRef = this.getGameRef(gameId);
        await (0, database_1.set)(gameRef, null);
    }
};
exports.GameRepository = GameRepository;
exports.GameRepository = GameRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GameRepository);
//# sourceMappingURL=game.repository.js.map