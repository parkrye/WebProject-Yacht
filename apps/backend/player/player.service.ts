import { Injectable } from '@nestjs/common';
import { Player } from '@/libs';
import { PlayerRepository } from './player.repository';
import { ResourceNotFoundException } from '../common';

@Injectable()
export class PlayerService {
  constructor(private readonly repo: PlayerRepository) {}

  create(player: Player): Player {
    return this.repo.save(player);
  }

  get(id: string): Player {
    const player = this.repo.findById(id);
    if (!player) throw new ResourceNotFoundException('Player');
    return player;
  }

  list(): Player[] {
    return this.repo.findAll();
  }
}
