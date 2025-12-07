// 카테고리별 점수 계산

/**
 * ScoreCalculatorService
 * - Category별 점수를 계산하여 Scorecard에 기록하는 역할만 수행 (SRP).
 * - 게임 규칙(GAME_RULES.md)을 기반으로 계산하고,
 *   점수판/턴/게임 흐름 로직은 포함하지 않는다.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { GameState } from '../entities/game-state';
import { Category } from '../types/category.enum';
import { Scorecard } from '../entities/scoreCard';
import { DiceSet } from '../entities/dice-set';

@Injectable()
export class ScoreCalculatorService {
  /**
   * 카테고리 점수를 계산하여 Scorecard에 반영한 새로운 GameState를 반환한다.
   */
  assignCategoryScore(state: GameState, category: Category): GameState {
    this.ensureCategoryNotFilled(state.scorecard, category);

    const diceValues = state.dice.values;
    const score = this.calculate(category, diceValues);

    const updatedScorecard: Scorecard = {
      ...state.scorecard,
      [category]: {
        score,
        filled: true,
      },
    };

    return {
      ...state,
      scorecard: updatedScorecard,
      updatedAt: Date.now(),
    };
  }

  /**
   * 이미 선택된 카테고리인지 확인
   */
  private ensureCategoryNotFilled(scorecard: Scorecard, category: Category): void {
    if (scorecard[category].filled) {
      throw new BadRequestException(`Category already filled: ${category}`);
    }
  }

  /**
   * 카테고리별 점수 계산
   * (GAME_RULES.md 로직을 그대로 반영)
   */
  private calculate(category: Category, values: number[]): number {
    const counts = this.countDice(values);
    const total = values.reduce((acc, v) => acc + v, 0);

    switch (category) {
      // ---- Upper Section ----
      case Category.Ones:   return this.sumByFace(values, 1);
      case Category.Twos:   return this.sumByFace(values, 2);
      case Category.Threes: return this.sumByFace(values, 3);
      case Category.Fours:  return this.sumByFace(values, 4);
      case Category.Fives:  return this.sumByFace(values, 5);
      case Category.Sixes:  return this.sumByFace(values, 6);

      // ---- Special Section ----
      case Category.ThreeOfKind:
        return this.hasCountAtLeast(counts, 3)
          ? this.sumMaxGroup(values, counts, 3)
          : 0;

      case Category.FourOfKind:
        return this.hasCountAtLeast(counts, 4)
          ? this.sumMaxGroup(values, counts, 4)
          : 0;

      case Category.FullHouse:
        return this.isFullHouse(counts) ? total : 0;

      case Category.SmallStraight:
        return this.hasSmallStraight(values) ? this.scoreSmallStraight(values) : 0;

      case Category.LargeStraight:
        return this.hasLargeStraight(values) ? total : 0;

      case Category.Choice:
        return total;

      case Category.Yacht:
        return this.isYacht(counts) ? 50 : 0;

      default:
        throw new BadRequestException(`Unknown category: ${category}`);
    }
  }

  // ------------------------ 계산 유틸 ------------------------

  private countDice(values: number[]): number[] {
    const result = Array(7).fill(0); // index 1 ~ 6 사용
    values.forEach((v) => (result[v] += 1));
    return result;
  }

  private sumByFace(values: number[], face: number): number {
    return values.filter((v) => v === face).reduce((acc, v) => acc + v, 0);
  }

  private hasCountAtLeast(counts: number[], target: number): boolean {
    return counts.some((c) => c >= target);
  }

  private sumMaxGroup(values: number[], counts: number[], target: number): number {
    const face = counts.findIndex((c) => c >= target);
    return face > 0 ? face * target : 0;
  }

  private isYacht(counts: number[]): boolean {
    return counts.some((c) => c === 5);
  }

  private isFullHouse(counts: number[]): boolean {
    const has3 = counts.some((c) => c === 3);
    const has2 = counts.some((c) => c === 2);
    return has3 && has2;
  }

  private hasSmallStraight(values: number[]): boolean {
    const set = new Set(values);
    return (
      (set.has(1) && set.has(2) && set.has(3) && set.has(4)) ||
      (set.has(2) && set.has(3) && set.has(4) && set.has(5)) ||
      (set.has(3) && set.has(4) && set.has(5) && set.has(6))
    );
  }

  private scoreSmallStraight(values: number[]): number {
    const set = new Set(values);
    if (set.has(1) && set.has(2) && set.has(3) && set.has(4)) return 1 + 2 + 3 + 4;
    if (set.has(2) && set.has(3) && set.has(4) && set.has(5)) return 2 + 3 + 4 + 5;
    if (set.has(3) && set.has(4) && set.has(5) && set.has(6)) return 3 + 4 + 5 + 6;
    return 0;
  }

  private hasLargeStraight(values: number[]): boolean {
    const sorted = [...values].sort();
    const is12345 = sorted.every((v, i) => v === i + 1);
    const is23456 = sorted.every((v, i) => v === i + 2);
    return is12345 || is23456;
  }
}
