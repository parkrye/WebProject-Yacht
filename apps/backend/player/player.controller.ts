import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { ApiResponse } from '../common';
import { Player } from '@/libs';

@Controller('player')
export class PlayerController {
  constructor(private readonly players: PlayerService) {}

  @Post()
  create(@Body() dto: Player): ApiResponse<Player> {
    return { success: true, data: this.players.create(dto) };
  }

  @Get(':id')
  get(@Param('id') id: string): ApiResponse<Player> {
    return { success: true, data: this.players.get(id) };
  }

  @Get()
  list(): ApiResponse<Player[]> {
    return { success: true, data: this.players.list() };
  }
}
