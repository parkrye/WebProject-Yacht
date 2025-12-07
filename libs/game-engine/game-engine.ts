/**
 * GameEngine
 * - 모든 게임 로직을 단일 인터페이스로 노출하는 퍼사드 계층.
 * - 내부적으로 DiceService / ScoreCalculatorService / TurnService / GameFlowService를 조합하지만
 *   엔진 사용자(Controller/Front/AI)는 GameEngine API만 알면 된다.
 */

import { GameFlowService } from '../services/game-flow.service';
import { DiceService } from '../services/dice.service';
import { TurnService } from '../services/turn.service';
import { ScoreCalculatorService } from '../services/score-calculator.service';

import { GameState } from '../entities/game-state';
import { Player } from '../entities/player';
import { Category } from '../types/category.enum';

export class GameEngine {
  constructor(
    private readonly gameFlow = new GameFlowService(),
    private readonly dice = new DiceService(),
    private readonly turn = new TurnService(new DiceService()),
    private readonly score = new ScoreCalculatorService(),
  ) {}

  /** 게임 생성 */
  create(gameId: string, players: Player[]): GameState {
    return this.gameFlow.createInitialGameState(gameId, players);
  }

  /** 현재 플레이어인지 검증 후 주사위 굴림 */
  roll(state: GameState, playerId: string, keepIndexes: number[]): GameState {
    this.turn.validateActiveTurn(state, playerId);
    return this.dice.roll(state, keepIndexes);
  }

  /** 카테고리 선택 + 점수 계산 + 턴 종료 + 게임 종료 평가 */
  selectCategory(state: GameState, playerId: string, category: Category): GameState {
    this.turn.validateActiveTurn(state, playerId);

    let updated = this.score.assignCategoryScore(state, category);
    updated = this.turn.endTurn(updated);
    updated = this.gameFlow.evaluateGameCompletion(updated);

    return updated;
  }
}
