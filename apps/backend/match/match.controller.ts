import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { ApiResponse } from '../common';
import { Player, Category, GameState } from '@/libs';

@Controller('match')
export class MatchController {
  constructor(private readonly match: MatchService) {}

  @Post()
  create(@Body() dto: { gameId: string; players: Player[] }): ApiResponse<GameState> {
    const { gameId, players } = dto;
    return { success: true, data: this.match.createMatch(gameId, players) };
  }

  @Patch(':id/roll')
  roll(
    @Param('id') id: string,
    @Body() dto: { playerId: string; keep: number[] },
  ): ApiResponse<GameState> {
    return { success: true, data: this.match.roll(id, dto.playerId, dto.keep) };
  }

  @Patch(':id/category')
  selectCategory(
    @Param('id') id: string,
    @Body() dto: { playerId: string; category: Category },
  ): ApiResponse<GameState> {
    return {
      success: true,
      data: this.match.selectCategory(id, dto.playerId, dto.category),
    };
  }

  @Get(':id')
  get(@Param('id') id: string): ApiResponse<GameState> {
    return { success: true, data: this.match.getState(id) };
  }
}
