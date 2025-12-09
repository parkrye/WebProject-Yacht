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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const game_dto_1 = require("./dto/game.dto");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    async createGame() {
        const gameState = await this.gameService.createGame();
        return { success: true, data: gameState };
    }
    async getGame(id) {
        const gameState = await this.gameService.getGame(id);
        if (!gameState) {
            throw new common_1.HttpException('Game not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { success: true, data: gameState };
    }
    async joinGame(id, dto) {
        const gameState = await this.gameService.joinGame(id, dto.playerId, dto.playerName);
        if (!gameState) {
            throw new common_1.HttpException('Failed to join game', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true, data: gameState };
    }
    async startGame(id) {
        const gameState = await this.gameService.startGame(id);
        if (!gameState) {
            throw new common_1.HttpException('Failed to start game', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true, data: gameState };
    }
    async rollDice(id) {
        const gameState = await this.gameService.rollDice(id);
        if (!gameState) {
            throw new common_1.HttpException('Failed to roll dice', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true, data: gameState };
    }
    async setKeepStatus(id, dto) {
        const gameState = await this.gameService.setKeepStatus(id, dto.keepStatus);
        if (!gameState) {
            throw new common_1.HttpException('Failed to set keep status', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true, data: gameState };
    }
    async selectScore(id, dto) {
        const gameState = await this.gameService.selectScore(id, dto.category);
        if (!gameState) {
            throw new common_1.HttpException('Failed to select score category', common_1.HttpStatus.BAD_REQUEST);
        }
        return { success: true, data: gameState };
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameController.prototype, "createGame", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGame", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, game_dto_1.JoinGameDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "joinGame", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "startGame", null);
__decorate([
    (0, common_1.Post)(':id/roll'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "rollDice", null);
__decorate([
    (0, common_1.Post)(':id/keep'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, game_dto_1.SetKeepStatusDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setKeepStatus", null);
__decorate([
    (0, common_1.Post)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, game_dto_1.SelectScoreDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "selectScore", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map