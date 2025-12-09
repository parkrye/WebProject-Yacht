"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreCategory = exports.GamePhase = void 0;
var GamePhase;
(function (GamePhase) {
    GamePhase["WAITING"] = "waiting";
    GamePhase["ROLLING"] = "rolling";
    GamePhase["SCORING"] = "scoring";
    GamePhase["FINISHED"] = "finished";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
var ScoreCategory;
(function (ScoreCategory) {
    // Upper Section
    ScoreCategory["ONES"] = "ones";
    ScoreCategory["TWOS"] = "twos";
    ScoreCategory["THREES"] = "threes";
    ScoreCategory["FOURS"] = "fours";
    ScoreCategory["FIVES"] = "fives";
    ScoreCategory["SIXES"] = "sixes";
    // Special Section
    ScoreCategory["THREE_OF_A_KIND"] = "threeOfAKind";
    ScoreCategory["FOUR_OF_A_KIND"] = "fourOfAKind";
    ScoreCategory["FULL_HOUSE"] = "fullHouse";
    ScoreCategory["SMALL_STRAIGHT"] = "smallStraight";
    ScoreCategory["LARGE_STRAIGHT"] = "largeStraight";
    ScoreCategory["CHOICE"] = "choice";
    ScoreCategory["YACHT"] = "yacht";
})(ScoreCategory || (exports.ScoreCategory = ScoreCategory = {}));
//# sourceMappingURL=game.type.js.map