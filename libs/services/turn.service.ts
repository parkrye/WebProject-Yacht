// 1명의 턴 진행 처리

/**
 * TurnService
 * - 플레이 순서를 관리하며, 각 턴의 시작/종료 흐름만 담당한다.
 * - 주사위 굴림 / 점수 계산 / 게임 종료 판정은 포함하지 않는다 (SRP).
 */

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GameState } from '../entities/game-state';
import { DiceService } from './dice.service';

@Injectable()
export class TurnService {
  constructor(private readonly diceService: DiceService) {}

  /**
   * 현재 activePlayer가 맞는지 검증
   * - Controller/Service에서 roll/selectCategory 요청 시 호출
   */
  validateActiveTurn(state: GameState, playerId: string): void {
    const expectedPlayer = state.players[state.activePlayerIndex];
    if (!expectedPlayer) {
      throw new BadRequestException(`Invalid active player index: ${state.activePlayerIndex}`);
    }
    if (expectedPlayer.id !== playerId) {
      throw new ForbiddenException(`Not this player's turn`);
    }
  }

  /**
   * 턴 종료 후 다음 플레이어로 이동
   * - ScoreCalculatorService 적용 이후 호출
   * - GameFlowService.evaluateGameCompletion() 이전에 호출되어야 함
   */
  endTurn(state: GameState): GameState {
    const nextState = this.diceService.resetForNextTurn(state);

    const totalPlayers = nextState.players.length;
    const isLastPlayerInRound = nextState.activePlayerIndex === totalPlayers - 1;

    const nextActiveIndex = isLastPlayerInRound
      ? 0
      : nextState.activePlayerIndex + 1;

    const nextRound = isLastPlayerInRound
      ? nextState.round + 1
      : nextState.round;

    return {
      ...nextState,
      activePlayerIndex: nextActiveIndex,
      round: nextRound,
      updatedAt: Date.now(),
    };
  }
}
