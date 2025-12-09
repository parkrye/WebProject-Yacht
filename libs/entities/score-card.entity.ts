import { ScoreCard, ScoreCategory } from '../types';

export function createEmptyScoreCard(): ScoreCard {
  return {
    [ScoreCategory.ONES]: null,
    [ScoreCategory.TWOS]: null,
    [ScoreCategory.THREES]: null,
    [ScoreCategory.FOURS]: null,
    [ScoreCategory.FIVES]: null,
    [ScoreCategory.SIXES]: null,
    [ScoreCategory.THREE_OF_A_KIND]: null,
    [ScoreCategory.FOUR_OF_A_KIND]: null,
    [ScoreCategory.FULL_HOUSE]: null,
    [ScoreCategory.SMALL_STRAIGHT]: null,
    [ScoreCategory.LARGE_STRAIGHT]: null,
    [ScoreCategory.CHOICE]: null,
    [ScoreCategory.YACHT]: null,
  };
}

export function isScoreCardComplete(scoreCard: ScoreCard): boolean {
  return Object.values(scoreCard).every((score) => score !== null);
}

export function getAvailableCategories(scoreCard: ScoreCard): ScoreCategory[] {
  return Object.entries(scoreCard)
    .filter(([, score]) => score === null)
    .map(([category]) => category as ScoreCategory);
}

export function getTotalScore(scoreCard: ScoreCard): number {
  return Object.values(scoreCard).reduce(
    (sum: number, score) => sum + (score ?? 0),
    0,
  );
}

export function getUpperSectionScore(scoreCard: ScoreCard): number {
  const upperCategories = [
    ScoreCategory.ONES,
    ScoreCategory.TWOS,
    ScoreCategory.THREES,
    ScoreCategory.FOURS,
    ScoreCategory.FIVES,
    ScoreCategory.SIXES,
  ];

  return upperCategories.reduce(
    (sum, category) => sum + (scoreCard[category] ?? 0),
    0,
  );
}
