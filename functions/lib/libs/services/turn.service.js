"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTurn = startTurn;
exports.performRoll = performRoll;
exports.selectCategory = selectCategory;
const types_1 = require("../types");
const entities_1 = require("../entities");
const dice_service_1 = require("./dice.service");
const score_calculator_service_1 = require("./score-calculator.service");
function startTurn(gameState) {
    if (gameState.phase !== types_1.GamePhase.WAITING && gameState.phase !== types_1.GamePhase.SCORING) {
        return {
            success: false,
            message: '현재 턴을 시작할 수 없는 상태입니다.',
            gameState,
        };
    }
    const newDiceSet = (0, entities_1.resetDiceSet)(gameState.diceSet);
    const rolledDiceSet = (0, dice_service_1.rollDice)(newDiceSet);
    return {
        success: true,
        message: '턴이 시작되었습니다.',
        gameState: {
            ...gameState,
            diceSet: rolledDiceSet,
            phase: types_1.GamePhase.ROLLING,
            updatedAt: Date.now(),
        },
    };
}
function performRoll(gameState) {
    if (gameState.phase !== types_1.GamePhase.ROLLING) {
        return {
            success: false,
            message: '주사위를 굴릴 수 없는 상태입니다.',
            gameState,
        };
    }
    const newDiceSet = (0, dice_service_1.rollDice)(gameState.diceSet);
    if (newDiceSet === gameState.diceSet) {
        return {
            success: false,
            message: '더 이상 주사위를 굴릴 수 없습니다.',
            gameState,
        };
    }
    return {
        success: true,
        message: `주사위를 굴렸습니다. (${newDiceSet.rollCount}/3)`,
        gameState: {
            ...gameState,
            diceSet: newDiceSet,
            updatedAt: Date.now(),
        },
    };
}
function selectCategory(gameState, category) {
    if (gameState.phase !== types_1.GamePhase.ROLLING) {
        return {
            success: false,
            message: '점수를 선택할 수 없는 상태입니다.',
            gameState,
        };
    }
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.scoreCard[category] !== null) {
        return {
            success: false,
            message: '이미 선택된 카테고리입니다.',
            gameState,
        };
    }
    const score = (0, score_calculator_service_1.calculateScore)(category, gameState.diceSet.values);
    const updatedPlayers = gameState.players.map((player, index) => {
        if (index !== gameState.currentPlayerIndex) {
            return player;
        }
        return {
            ...player,
            scoreCard: {
                ...player.scoreCard,
                [category]: score,
            },
        };
    });
    let updatedGameState = {
        ...gameState,
        players: updatedPlayers,
        phase: types_1.GamePhase.SCORING,
        updatedAt: Date.now(),
    };
    updatedGameState = (0, entities_1.moveToNextPlayer)(updatedGameState);
    if ((0, entities_1.isGameComplete)(updatedGameState)) {
        updatedGameState = {
            ...updatedGameState,
            phase: types_1.GamePhase.FINISHED,
        };
    }
    return {
        success: true,
        message: `${category}에 ${score}점을 기록했습니다.`,
        gameState: updatedGameState,
    };
}
//# sourceMappingURL=turn.service.js.map