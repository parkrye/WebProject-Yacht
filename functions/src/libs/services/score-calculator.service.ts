import { ScoreCategory } from '../types';
import { SCORE_CONSTANTS } from '../constants';
import { getDiceCounts, getSortedValues } from './dice.service';

export function calculateScore(
  category: ScoreCategory,
  diceValues: number[],
): number {
  switch (category) {
    case ScoreCategory.ONES:
      return calculateUpperSection(diceValues, 1);
    case ScoreCategory.TWOS:
      return calculateUpperSection(diceValues, 2);
    case ScoreCategory.THREES:
      return calculateUpperSection(diceValues, 3);
    case ScoreCategory.FOURS:
      return calculateUpperSection(diceValues, 4);
    case ScoreCategory.FIVES:
      return calculateUpperSection(diceValues, 5);
    case ScoreCategory.SIXES:
      return calculateUpperSection(diceValues, 6);
    case ScoreCategory.THREE_OF_A_KIND:
      return calculateThreeOfAKind(diceValues);
    case ScoreCategory.FOUR_OF_A_KIND:
      return calculateFourOfAKind(diceValues);
    case ScoreCategory.FULL_HOUSE:
      return calculateFullHouse(diceValues);
    case ScoreCategory.SMALL_STRAIGHT:
      return calculateSmallStraight(diceValues);
    case ScoreCategory.LARGE_STRAIGHT:
      return calculateLargeStraight(diceValues);
    case ScoreCategory.CHOICE:
      return calculateChoice(diceValues);
    case ScoreCategory.YACHT:
      return calculateYacht(diceValues);
    default:
      return 0;
  }
}

function calculateUpperSection(diceValues: number[], target: number): number {
  return diceValues.filter((v) => v === target).reduce((sum, v) => sum + v, 0);
}

function calculateThreeOfAKind(diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);

  for (const [value, count] of counts.entries()) {
    if (count >= 3) {
      return value * 3;
    }
  }

  return 0;
}

function calculateFourOfAKind(diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);

  for (const [value, count] of counts.entries()) {
    if (count >= 4) {
      return value * 4;
    }
  }

  return 0;
}

function calculateFullHouse(diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);
  const countValues = Array.from(counts.values());

  const hasThree = countValues.includes(3);
  const hasTwo = countValues.includes(2);
  const hasFive = countValues.includes(5);

  if ((hasThree && hasTwo) || hasFive) {
    return diceValues.reduce((sum, v) => sum + v, 0);
  }

  return 0;
}

function calculateSmallStraight(diceValues: number[]): number {
  const sorted = getSortedValues(diceValues);
  const unique = [...new Set(sorted)];

  const smallStraights = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];

  for (const straight of smallStraights) {
    if (straight.every((v) => unique.includes(v))) {
      return straight.reduce((sum, v) => sum + v, 0);
    }
  }

  return 0;
}

function calculateLargeStraight(diceValues: number[]): number {
  const sorted = getSortedValues(diceValues);
  const unique = [...new Set(sorted)];

  const largeStraights = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
  ];

  for (const straight of largeStraights) {
    if (straight.every((v) => unique.includes(v))) {
      return diceValues.reduce((sum, v) => sum + v, 0);
    }
  }

  return 0;
}

function calculateChoice(diceValues: number[]): number {
  return diceValues.reduce((sum, v) => sum + v, 0);
}

function calculateYacht(diceValues: number[]): number {
  const counts = getDiceCounts(diceValues);

  for (const count of counts.values()) {
    if (count === 5) {
      return SCORE_CONSTANTS.YACHT_BONUS;
    }
  }

  return 0;
}

export function calculateAllPossibleScores(
  diceValues: number[],
): Map<ScoreCategory, number> {
  const scores = new Map<ScoreCategory, number>();

  for (const category of Object.values(ScoreCategory)) {
    scores.set(category, calculateScore(category, diceValues));
  }

  return scores;
}
