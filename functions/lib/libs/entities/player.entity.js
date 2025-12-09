"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayer = createPlayer;
const score_card_entity_1 = require("./score-card.entity");
function createPlayer(id, name) {
    return {
        id,
        name,
        scoreCard: (0, score_card_entity_1.createEmptyScoreCard)(),
    };
}
//# sourceMappingURL=player.entity.js.map