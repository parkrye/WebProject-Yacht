"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
exports.calculateAllPossibleScores = calculateAllPossibleScores;
const types_1 = require("../types");
const constants_1 = require("../constants");
const dice_service_1 = require("./dice.service");
function calculateScore(category, diceValues) {
    switch (category) {
        case types_1.ScoreCategory.ONES:
            return calculateUpperSection(diceValues, 1);
        case types_1.ScoreCategory.TWOS:
            return calculateUpperSection(diceValues, 2);
        case types_1.ScoreCategory.THREES:
            return calculateUpperSection(diceValues, 3);
        case types_1.ScoreCategory.FOURS:
            return calculateUpperSection(diceValues, 4);
        case types_1.ScoreCategory.FIVES:
            return calculateUpperSection(diceValues, 5);
        case types_1.ScoreCategory.SIXES:
            return calculateUpperSection(diceValues, 6);
        case types_1.ScoreCategory.THREE_OF_A_KIND:
            return calculateThreeOfAKind(diceValues);
        case types_1.ScoreCategory.FOUR_OF_A_KIND:
            return calculateFourOfAKind(diceValues);
        case types_1.ScoreCategory.FULL_HOUSE:
            return calculateFullHouse(diceValues);
        case types_1.ScoreCategory.SMALL_STRAIGHT:
            return calculateSmallStraight(diceValues);
        case types_1.ScoreCategory.LARGE_STRAIGHT:
            return calculateLargeStraight(diceValues);
        case types_1.ScoreCategory.CHOICE:
            return calculateChoice(diceValues);
        case types_1.ScoreCategory.YACHT:
            return calculateYacht(diceValues);
        default:
            return 0;
    }
}
function calculateUpperSection(diceValues, target) {
    return diceValues.filter((v) => v === target).reduce((sum, v) => sum + v, 0);
}
function calculateThreeOfAKind(diceValues) {
    const counts = (0, dice_service_1.getDiceCounts)(diceValues);
    for (const [value, count] of counts.entries()) {
        if (count >= 3) {
            return value * 3;
        }
    }
    return 0;
}
function calculateFourOfAKind(diceValues) {
    const counts = (0, dice_service_1.getDiceCounts)(diceValues);
    for (const [value, count] of counts.entries()) {
        if (count >= 4) {
            return value * 4;
        }
    }
    return 0;
}
function calculateFullHouse(diceValues) {
    const counts = (0, dice_service_1.getDiceCounts)(diceValues);
    const countValues = Array.from(counts.values());
    const hasThree = countValues.includes(3);
    const hasTwo = countValues.includes(2);
    const hasFive = countValues.includes(5);
    if ((hasThree && hasTwo) || hasFive) {
        return diceValues.reduce((sum, v) => sum + v, 0);
    }
    return 0;
}
function calculateSmallStraight(diceValues) {
    const sorted = (0, dice_service_1.getSortedValues)(diceValues);
    const unique = [...new Set(sorted)];
    const smallStraights = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
    ];
    for (const straight of smallStraights) {
        if (straight.every((v) => unique.includes(v))) {
            return straight.reduce((sum, v) => sum + v, 0);
        }
    }
    return 0;
}
function calculateLargeStraight(diceValues) {
    const sorted = (0, dice_service_1.getSortedValues)(diceValues);
    const unique = [...new Set(sorted)];
    const largeStraights = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
    ];
    for (const straight of largeStraights) {
        if (straight.every((v) => unique.includes(v))) {
            return diceValues.reduce((sum, v) => sum + v, 0);
        }
    }
    return 0;
}
function calculateChoice(diceValues) {
    return diceValues.reduce((sum, v) => sum + v, 0);
}
function calculateYacht(diceValues) {
    const counts = (0, dice_service_1.getDiceCounts)(diceValues);
    for (const count of counts.values()) {
        if (count === 5) {
            return constants_1.SCORE_CONSTANTS.YACHT_BONUS;
        }
    }
    return 0;
}
function calculateAllPossibleScores(diceValues) {
    const scores = new Map();
    for (const category of Object.values(types_1.ScoreCategory)) {
        scores.set(category, calculateScore(category, diceValues));
    }
    return scores;
}
//# sourceMappingURL=score-calculator.service.js.map