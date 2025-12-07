// 라운드/게임 종료 처리

/**
 * GameFlowService
 * - 게임의 전체 흐름을 관리하는 서비스(초기 상태 생성 + 종료 판정)
 * - 턴 진행/주사위 굴림/카테고리 선택 로직은 포함하지 않는다 (SRP).
 */

import { Injectable } from '@nestjs/common';
import { GameState } from '../entities/game-state';
import { Player } from '../entities/player';
import { DiceSet } from '../entities/dice-set';
import { Scorecard } from '../entities/scorecard';
import { Category } from '../types/category.enum';

@Injectable()
export class GameFlowService {
  /**
   * 새로운 게임의 초기 GameState 생성
   */
  createInitialGameState(gameId: string, players: Player[]): GameState {
    const initialScorecard = this.createInitialScorecard();
    const initialDice = new DiceSet(); // 값 0, keep false

    return {
      gameId,
      players,
      activePlayerIndex: 0,
      round: 0,
      dice: initialDice,
      rollCount: 0,
      scorecard: initialScorecard,
      isFinished: false,
      updatedAt: Date.now(),
    };
  }

  /**
   * 게임 종료 여부 평가
   * - 모든 카테고리가 filled=true이면 종료
   */
  evaluateGameCompletion(state: GameState): GameState {
    const isAllCategoriesFilled = Object.values(state.scorecard).every(
      (entry) => entry.filled,
    );

    // 이미 종료 상태면 변경 없음
    if (state.isFinished || !isAllCategoriesFilled) {
      return {
        ...state,
        updatedAt: Date.now(),
      };
    }

    return {
      ...state,
      isFinished: true,
      updatedAt: Date.now(),
    };
  }

  /**
   * 초기 Scorecard 생성
   * - Category enum 기반 생성 (하드코딩 금지)
   */
  private createInitialScorecard(): Scorecard {
    return Object.values(Category).reduce((acc, category) => {
      acc[category] = { score: null, filled: false };
      return acc;
    }, {} as Scorecard);
  }
}
