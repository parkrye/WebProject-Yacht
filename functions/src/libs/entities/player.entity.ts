import { Player } from '../types';
import { createEmptyScoreCard } from './score-card.entity';

export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    scoreCard: createEmptyScoreCard(),
  };
}
