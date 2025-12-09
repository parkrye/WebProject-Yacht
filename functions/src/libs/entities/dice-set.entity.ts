import { DiceSet } from '../types';
import { GAME_CONSTANTS } from '../constants';

export function createDiceSet(): DiceSet {
  return {
    values: Array(GAME_CONSTANTS.DICE_COUNT).fill(0),
    kept: Array(GAME_CONSTANTS.DICE_COUNT).fill(false),
    rollCount: 0,
  };
}

export function resetDiceSet(diceSet: DiceSet): DiceSet {
  return {
    values: Array(GAME_CONSTANTS.DICE_COUNT).fill(0),
    kept: Array(GAME_CONSTANTS.DICE_COUNT).fill(false),
    rollCount: 0,
  };
}

export function canRoll(diceSet: DiceSet): boolean {
  return diceSet.rollCount < GAME_CONSTANTS.MAX_ROLLS_PER_TURN;
}

export function toggleKeep(diceSet: DiceSet, index: number): DiceSet {
  if (index < 0 || index >= GAME_CONSTANTS.DICE_COUNT) {
    return diceSet;
  }

  const newKept = [...diceSet.kept];
  newKept[index] = !newKept[index];

  return {
    ...diceSet,
    kept: newKept,
  };
}

export function setKeepStatus(
  diceSet: DiceSet,
  keepStatus: boolean[],
): DiceSet {
  if (keepStatus.length !== GAME_CONSTANTS.DICE_COUNT) {
    return diceSet;
  }

  return {
    ...diceSet,
    kept: [...keepStatus],
  };
}
