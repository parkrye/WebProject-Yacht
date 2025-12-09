"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = rollDice;
exports.getDiceCounts = getDiceCounts;
exports.getSortedValues = getSortedValues;
const constants_1 = require("../constants");
const entities_1 = require("../entities");
function rollSingleDice() {
    return (Math.floor(Math.random() *
        (constants_1.GAME_CONSTANTS.DICE_MAX_VALUE - constants_1.GAME_CONSTANTS.DICE_MIN_VALUE + 1)) + constants_1.GAME_CONSTANTS.DICE_MIN_VALUE);
}
function rollDice(diceSet) {
    if (!(0, entities_1.canRoll)(diceSet)) {
        return diceSet;
    }
    const newValues = diceSet.values.map((value, index) => {
        if (diceSet.kept[index]) {
            return value;
        }
        return rollSingleDice();
    });
    return {
        ...diceSet,
        values: newValues,
        rollCount: diceSet.rollCount + 1,
    };
}
function getDiceCounts(values) {
    const counts = new Map();
    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
}
function getSortedValues(values) {
    return [...values].sort((a, b) => a - b);
}
//# sourceMappingURL=dice.service.js.map