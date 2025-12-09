import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JoinGameDto, SetKeepStatusDto, SelectScoreDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async createGame() {
    const gameState = await this.gameService.createGame();
    return { success: true, data: gameState };
  }

  @Get(':id')
  async getGame(@Param('id') id: string) {
    const gameState = await this.gameService.getGame(id);

    if (!gameState) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    return { success: true, data: gameState };
  }

  @Post(':id/join')
  async joinGame(@Param('id') id: string, @Body() dto: JoinGameDto) {
    const gameState = await this.gameService.joinGame(
      id,
      dto.playerId,
      dto.playerName,
    );

    if (!gameState) {
      throw new HttpException(
        'Failed to join game',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, data: gameState };
  }

  @Post(':id/start')
  async startGame(@Param('id') id: string) {
    const gameState = await this.gameService.startGame(id);

    if (!gameState) {
      throw new HttpException(
        'Failed to start game',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, data: gameState };
  }

  @Post(':id/roll')
  async rollDice(@Param('id') id: string) {
    const gameState = await this.gameService.rollDice(id);

    if (!gameState) {
      throw new HttpException(
        'Failed to roll dice',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, data: gameState };
  }

  @Post(':id/keep')
  async setKeepStatus(
    @Param('id') id: string,
    @Body() dto: SetKeepStatusDto,
  ) {
    const gameState = await this.gameService.setKeepStatus(id, dto.keepStatus);

    if (!gameState) {
      throw new HttpException(
        'Failed to set keep status',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, data: gameState };
  }

  @Post(':id/score')
  async selectScore(@Param('id') id: string, @Body() dto: SelectScoreDto) {
    const gameState = await this.gameService.selectScore(id, dto.category);

    if (!gameState) {
      throw new HttpException(
        'Failed to select score category',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success: true, data: gameState };
  }
}
