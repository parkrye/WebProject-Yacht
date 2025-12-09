import { DiceSet } from '../types';
import { GAME_CONSTANTS } from '../constants';
import { canRoll } from '../entities';

function rollSingleDice(): number {
  return (
    Math.floor(
      Math.random() *
        (GAME_CONSTANTS.DICE_MAX_VALUE - GAME_CONSTANTS.DICE_MIN_VALUE + 1),
    ) + GAME_CONSTANTS.DICE_MIN_VALUE
  );
}

export function rollDice(diceSet: DiceSet): DiceSet {
  if (!canRoll(diceSet)) {
    return diceSet;
  }

  const newValues = diceSet.values.map((value, index) => {
    if (diceSet.kept[index]) {
      return value;
    }
    return rollSingleDice();
  });

  return {
    ...diceSet,
    values: newValues,
    rollCount: diceSet.rollCount + 1,
  };
}

export function getDiceCounts(values: number[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

export function getSortedValues(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}
