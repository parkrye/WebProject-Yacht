// 백엔드 서비스 (Turn/Game 진행)

/**
 * GameService
 * - GameController와 GameRepository, game-engine을 연결하는 핵심 서비스 레이어
 * - 비즈니스 로직(턴 흐름 / 플레이 진행 / 점수 기록 / 게임 종료 관리)을 담당한다.
 * - 게임 규칙 자체는 game-engine(ScoreCalculatorService, TurnService, etc.)가 처리하도록 위임한다.
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GameRepository } from './game.repository';
import { CreateGameRequestDto, RollDiceRequestDto, SelectCategoryRequestDto } from './dto';

import { GameState } from '@libs/game-engine/entities/game-state';
import { Player } from '@libs/game-engine/entities/player';
import { DiceService } from '@libs/game-engine/services/dice.service';
import { TurnService } from '@libs/game-engine/services/turn.service';
import { ScoreCalculatorService } from '@libs/game-engine/services/score-calculator.service';
import { GameFlowService } from '@libs/game-engine/services/game-flow.service';

import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  constructor(
    private readonly repository: GameRepository,
    private readonly diceService: DiceService,
    private readonly turnService: TurnService,
    private readonly scoreCalculator: ScoreCalculatorService,
    private readonly gameFlowService: GameFlowService,
  ) {}

  /**
   * 게임 생성
   * playerNames를 기반으로 새로운 GameState를 생성 후 저장
   */
  createGame(dto: CreateGameRequestDto): { gameId: string } {
    const gameId = uuid();
    const players: Player[] = dto.playerNames.map((name) => ({ id: uuid(), name }));

    const initialState: GameState = this.gameFlowService.createInitialGameState(gameId, players);
    this.repository.save(gameId, initialState);

    return { gameId };
  }

  /**
   * 현재 게임 상태 조회
   */
  getGameState(gameId: string): GameState {
    const state = this.repository.findById(gameId);
    if (!state) throw new NotFoundException(`Game not found: ${gameId}`);
    return state;
  }

  /**
   * 주사위 굴림
   */
  rollDice(gameId: string, dto: RollDiceRequestDto): GameState {
    const state = this.getGameState(gameId);

    this.turnService.validateActiveTurn(state, dto.playerId);
    const updatedState = this.diceService.roll(state, dto.keepIndexes);

    this.repository.update(gameId, updatedState);
    return updatedState;
  }

  /**
   * 점수 카테고리 선택
   * - 점수를 계산하고 state 업데이트
   * - 턴 종료 및 라운드/게임 종료 처리
   */
  selectCategory(gameId: string, dto: SelectCategoryRequestDto): GameState {
    const state = this.getGameState(gameId);

    this.turnService.validateActiveTurn(state, dto.playerId);

    // 점수 계산
    const stateWithScore = this.scoreCalculator.assignCategoryScore(state, dto.category);

    // 턴/라운드 진행
    const progressedState = this.turnService.endTurn(stateWithScore);

    // 게임 종료 여부 판정
    const finalState = this.gameFlowService.evaluateGameCompletion(progressedState);

    this.repository.update(gameId, finalState);
    return finalState;
  }

  /**
   * 게임 종료 여부 확인
   */
  isGameFinished(gameId: string): { isFinished: boolean } {
    const state = this.getGameState(gameId);
    return { isFinished: state.isFinished };
  }
}
