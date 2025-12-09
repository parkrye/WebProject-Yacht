"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const types_1 = require("../types");
const entities_1 = require("../entities");
const services_1 = require("../services");
const constants_1 = require("../constants");
class GameEngine {
    constructor(gameId) {
        this.gameState = (0, entities_1.createGameState)(gameId);
    }
    getState() {
        return this.gameState;
    }
    setState(state) {
        this.gameState = state;
    }
    addPlayer(playerId, playerName) {
        if (this.gameState.players.length >= constants_1.GAME_CONSTANTS.MAX_PLAYERS) {
            return false;
        }
        if (this.gameState.phase !== types_1.GamePhase.WAITING) {
            return false;
        }
        const existingPlayer = this.gameState.players.find((p) => p.id === playerId);
        if (existingPlayer) {
            return false;
        }
        const player = (0, entities_1.createPlayer)(playerId, playerName);
        this.gameState = (0, entities_1.addPlayerToGame)(this.gameState, player);
        return true;
    }
    startGame() {
        if (this.gameState.players.length < constants_1.GAME_CONSTANTS.MIN_PLAYERS) {
            return false;
        }
        if (this.gameState.phase !== types_1.GamePhase.WAITING) {
            return false;
        }
        const result = (0, services_1.startTurn)(this.gameState);
        if (result.success) {
            this.gameState = result.gameState;
        }
        return result.success;
    }
    roll() {
        const result = (0, services_1.performRoll)(this.gameState);
        if (result.success) {
            this.gameState = result.gameState;
        }
        return result;
    }
    toggleDiceKeep(index) {
        if (this.gameState.phase !== types_1.GamePhase.ROLLING) {
            return false;
        }
        this.gameState = {
            ...this.gameState,
            diceSet: (0, entities_1.toggleKeep)(this.gameState.diceSet, index),
            updatedAt: Date.now(),
        };
        return true;
    }
    setDiceKeepStatus(keepStatus) {
        if (this.gameState.phase !== types_1.GamePhase.ROLLING) {
            return false;
        }
        this.gameState = {
            ...this.gameState,
            diceSet: (0, entities_1.setKeepStatus)(this.gameState.diceSet, keepStatus),
            updatedAt: Date.now(),
        };
        return true;
    }
    selectScoreCategory(category) {
        const result = (0, services_1.selectCategory)(this.gameState, category);
        if (result.success) {
            this.gameState = result.gameState;
            if (this.gameState.phase !== types_1.GamePhase.FINISHED) {
                const turnResult = (0, services_1.startTurn)(this.gameState);
                if (turnResult.success) {
                    this.gameState = turnResult.gameState;
                }
            }
        }
        return result;
    }
    getCurrentPlayer() {
        return (0, entities_1.getCurrentPlayer)(this.gameState);
    }
    getPossibleScores() {
        return (0, services_1.calculateAllPossibleScores)(this.gameState.diceSet.values);
    }
    getPlayerScores() {
        return this.gameState.players.map((player) => ({
            player,
            total: (0, entities_1.getTotalScore)(player.scoreCard),
        }));
    }
    getWinner() {
        if (this.gameState.phase !== types_1.GamePhase.FINISHED) {
            return null;
        }
        const scores = this.getPlayerScores();
        if (scores.length === 0) {
            return null;
        }
        const maxScore = Math.max(...scores.map((s) => s.total));
        const winner = scores.find((s) => s.total === maxScore);
        return winner?.player ?? null;
    }
    isGameOver() {
        return this.gameState.phase === types_1.GamePhase.FINISHED;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=game-engine.js.map