"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGameState = createGameState;
exports.addPlayerToGame = addPlayerToGame;
exports.getCurrentPlayer = getCurrentPlayer;
exports.moveToNextPlayer = moveToNextPlayer;
exports.isGameComplete = isGameComplete;
const types_1 = require("../types");
const dice_set_entity_1 = require("./dice-set.entity");
function createGameState(id) {
    const now = Date.now();
    return {
        id,
        players: [],
        currentPlayerIndex: 0,
        diceSet: (0, dice_set_entity_1.createDiceSet)(),
        phase: types_1.GamePhase.WAITING,
        round: 1,
        createdAt: now,
        updatedAt: now,
    };
}
function addPlayerToGame(gameState, player) {
    return {
        ...gameState,
        players: [...gameState.players, player],
        updatedAt: Date.now(),
    };
}
function getCurrentPlayer(gameState) {
    if (gameState.players.length === 0) {
        return null;
    }
    return gameState.players[gameState.currentPlayerIndex];
}
function moveToNextPlayer(gameState) {
    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const isNewRound = nextIndex === 0;
    return {
        ...gameState,
        currentPlayerIndex: nextIndex,
        round: isNewRound ? gameState.round + 1 : gameState.round,
        updatedAt: Date.now(),
    };
}
function isGameComplete(gameState) {
    return gameState.players.every((player) => Object.values(player.scoreCard).every((score) => score !== null));
}
//# sourceMappingURL=game-state.entity.js.map