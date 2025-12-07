import { Player } from '@/libs';

export class PlayerRepository {
  private players = new Map<string, Player>();

  save(player: Player): Player {
    this.players.set(player.id, player);
    return player;
  }

  findById(id: string): Player | null {
    return this.players.get(id) ?? null;
  }

  findAll(): Player[] {
    return [...this.players.values()];
  }
}
