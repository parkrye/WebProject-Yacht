"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyScoreCard = createEmptyScoreCard;
exports.isScoreCardComplete = isScoreCardComplete;
exports.getAvailableCategories = getAvailableCategories;
exports.getTotalScore = getTotalScore;
exports.getUpperSectionScore = getUpperSectionScore;
const types_1 = require("../types");
function createEmptyScoreCard() {
    return {
        [types_1.ScoreCategory.ONES]: null,
        [types_1.ScoreCategory.TWOS]: null,
        [types_1.ScoreCategory.THREES]: null,
        [types_1.ScoreCategory.FOURS]: null,
        [types_1.ScoreCategory.FIVES]: null,
        [types_1.ScoreCategory.SIXES]: null,
        [types_1.ScoreCategory.THREE_OF_A_KIND]: null,
        [types_1.ScoreCategory.FOUR_OF_A_KIND]: null,
        [types_1.ScoreCategory.FULL_HOUSE]: null,
        [types_1.ScoreCategory.SMALL_STRAIGHT]: null,
        [types_1.ScoreCategory.LARGE_STRAIGHT]: null,
        [types_1.ScoreCategory.CHOICE]: null,
        [types_1.ScoreCategory.YACHT]: null,
    };
}
function isScoreCardComplete(scoreCard) {
    return Object.values(scoreCard).every((score) => score !== null);
}
function getAvailableCategories(scoreCard) {
    return Object.entries(scoreCard)
        .filter(([, score]) => score === null)
        .map(([category]) => category);
}
function getTotalScore(scoreCard) {
    return Object.values(scoreCard).reduce((sum, score) => sum + (score ?? 0), 0);
}
function getUpperSectionScore(scoreCard) {
    const upperCategories = [
        types_1.ScoreCategory.ONES,
        types_1.ScoreCategory.TWOS,
        types_1.ScoreCategory.THREES,
        types_1.ScoreCategory.FOURS,
        types_1.ScoreCategory.FIVES,
        types_1.ScoreCategory.SIXES,
    ];
    return upperCategories.reduce((sum, category) => sum + (scoreCard[category] ?? 0), 0);
}
//# sourceMappingURL=score-card.entity.js.map