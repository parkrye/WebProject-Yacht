// 주사위 굴림/고정 처리

/**
 * DiceService
 * - 주사위 굴림에 대한 검증 및 DiceSet 객체 업데이트를 담당.
 * - 실제 랜덤 주사위 값 생성은 DiceSet.roll()이 수행.
 * - 턴/라운드·카테고리 결정 로직은 포함하지 않는다 (SRP).
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { GameState } from '../entities/game-state';
import { DiceSet } from '../entities/dice-set';

@Injectable()
export class DiceService {
  private static readonly MAX_ROLL_COUNT = 3; // 게임 규칙 기반

  /**
   * 주사위를 굴리고 GameState를 업데이트한 새로운 상태를 반환한다.
   * keepIndexes: 유지할 주사위 인덱스 목록
   */
  roll(state: GameState, keepIndexes: number[]): GameState {
    this.validateRollAvailable(state);

    const nextDiceState = state.dice
      .setKeepFlags(keepIndexes)
      .roll(); // 불변 객체이므로 새로운 DiceSet 반환

    return {
      ...state,
      dice: nextDiceState,
      rollCount: state.rollCount + 1,
      updatedAt: Date.now(),
    };
  }

  /**
   * 굴릴 수 있는지 검증
   * - MAX_ROLL_COUNT(기본 3회)를 초과할 수 없다.
   */
  private validateRollAvailable(state: GameState): void {
    if (state.rollCount >= DiceService.MAX_ROLL_COUNT) {
      throw new BadRequestException(
        `Cannot roll: rollCount has already reached ${DiceService.MAX_ROLL_COUNT}`,
      );
    }
  }

  /**
   * 새 턴 시작 시 주사위 상태 초기화
   * - turnService에서 호출하는 유틸
   */
  resetForNextTurn(state: GameState): GameState {
    const resetDice = state.dice.resetKeepFlags();

    return {
      ...state,
      dice: resetDice,
      rollCount: 0,
      updatedAt: Date.now(),
    };
  }
}
