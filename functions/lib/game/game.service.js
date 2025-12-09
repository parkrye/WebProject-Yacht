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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const game_repository_1 = require("./game.repository");
const game_engine_1 = require("./game-engine");
const uuid_1 = require("uuid");
let GameService = class GameService {
    constructor(gameRepository) {
        this.gameRepository = gameRepository;
        this.gameEngines = new Map();
    }
    getOrCreateEngine(gameId) {
        let engine = this.gameEngines.get(gameId);
        if (!engine) {
            engine = new game_engine_1.GameEngine(gameId);
            this.gameEngines.set(gameId, engine);
        }
        return engine;
    }
    async createGame() {
        const gameId = (0, uuid_1.v4)();
        const engine = this.getOrCreateEngine(gameId);
        const state = engine.getState();
        await this.gameRepository.save(state);
        return state;
    }
    async getGame(gameId) {
        const state = await this.gameRepository.findById(gameId);
        if (state) {
            const engine = this.getOrCreateEngine(gameId);
            engine.setState(state);
        }
        return state;
    }
    async joinGame(gameId, playerId, playerName) {
        const state = await this.getGame(gameId);
        if (!state) {
            return null;
        }
        const engine = this.getOrCreateEngine(gameId);
        engine.setState(state);
        const success = engine.addPlayer(playerId, playerName);
        if (!success) {
            return null;
        }
        const newState = engine.getState();
        await this.gameRepository.save(newState);
        return newState;
    }
    async startGame(gameId) {
        const state = await this.getGame(gameId);
        if (!state) {
            return null;
        }
        const engine = this.getOrCreateEngine(gameId);
        engine.setState(state);
        const success = engine.startGame();
        if (!success) {
            return null;
        }
        const newState = engine.getState();
        await this.gameRepository.save(newState);
        return newState;
    }
    async rollDice(gameId) {
        const state = await this.getGame(gameId);
        if (!state) {
            return null;
        }
        const engine = this.getOrCreateEngine(gameId);
        engine.setState(state);
        const result = engine.roll();
        if (!result.success) {
            return null;
        }
        const newState = engine.getState();
        await this.gameRepository.save(newState);
        return newState;
    }
    async setKeepStatus(gameId, keepStatus) {
        const state = await this.getGame(gameId);
        if (!state) {
            return null;
        }
        const engine = this.getOrCreateEngine(gameId);
        engine.setState(state);
        const success = engine.setDiceKeepStatus(keepStatus);
        if (!success) {
            return null;
        }
        const newState = engine.getState();
        await this.gameRepository.save(newState);
        return newState;
    }
    async selectScore(gameId, category) {
        const state = await this.getGame(gameId);
        if (!state) {
            console.log('[selectScore] Game not found:', gameId);
            return null;
        }
        console.log('[selectScore] Current state:', {
            phase: state.phase,
            round: state.round,
            currentPlayerIndex: state.currentPlayerIndex,
            rollCount: state.diceSet.rollCount,
            category,
            scoreCard: state.players[state.currentPlayerIndex]?.scoreCard,
        });
        const engine = this.getOrCreateEngine(gameId);
        engine.setState(state);
        const result = engine.selectScoreCategory(category);
        console.log('[selectScore] Result:', {
            success: result.success,
            message: result.message,
        });
        if (!result.success) {
            return null;
        }
        const newState = engine.getState();
        console.log('[selectScore] New state:', {
            phase: newState.phase,
            round: newState.round,
            currentPlayerIndex: newState.currentPlayerIndex,
            rollCount: newState.diceSet.rollCount,
        });
        await this.gameRepository.save(newState);
        return newState;
    }
    cleanupEngine(gameId) {
        this.gameEngines.delete(gameId);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [game_repository_1.GameRepository])
], GameService);
//# sourceMappingURL=game.service.js.map