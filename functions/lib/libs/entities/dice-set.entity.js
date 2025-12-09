"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiceSet = createDiceSet;
exports.resetDiceSet = resetDiceSet;
exports.canRoll = canRoll;
exports.toggleKeep = toggleKeep;
exports.setKeepStatus = setKeepStatus;
const constants_1 = require("../constants");
function createDiceSet() {
    return {
        values: Array(constants_1.GAME_CONSTANTS.DICE_COUNT).fill(0),
        kept: Array(constants_1.GAME_CONSTANTS.DICE_COUNT).fill(false),
        rollCount: 0,
    };
}
function resetDiceSet(diceSet) {
    return {
        values: Array(constants_1.GAME_CONSTANTS.DICE_COUNT).fill(0),
        kept: Array(constants_1.GAME_CONSTANTS.DICE_COUNT).fill(false),
        rollCount: 0,
    };
}
function canRoll(diceSet) {
    return diceSet.rollCount < constants_1.GAME_CONSTANTS.MAX_ROLLS_PER_TURN;
}
function toggleKeep(diceSet, index) {
    if (index < 0 || index >= constants_1.GAME_CONSTANTS.DICE_COUNT) {
        return diceSet;
    }
    const newKept = [...diceSet.kept];
    newKept[index] = !newKept[index];
    return {
        ...diceSet,
        kept: newKept,
    };
}
function setKeepStatus(diceSet, keepStatus) {
    if (keepStatus.length !== constants_1.GAME_CONSTANTS.DICE_COUNT) {
        return diceSet;
    }
    return {
        ...diceSet,
        kept: [...keepStatus],
    };
}
//# sourceMappingURL=dice-set.entity.js.map