import { useEffect, useState } from 'react';
import { GameState, Category } from '@/libs';
import { matchService } from '../services/match.service';

export function useGame(gameId: string) {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    matchService.get(gameId).then(setState);
  }, [gameId]);

  const roll = (playerId: string, keep?: number[]) =>
    matchService.roll(gameId, playerId, keep ?? []).then(setState);

  const select = (playerId: string, category: Category) =>
    matchService.select(gameId, playerId, category).then(setState);

  return { state, roll, select };
}
