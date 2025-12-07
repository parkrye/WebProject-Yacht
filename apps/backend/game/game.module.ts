/**
 * GameModule
 * - GameController / GameService / GameRepository를 연결하는 NestJS 모듈
 * - 게임 규칙 로직은 libs/game-engine 에서 처리하며 이 모듈은 엔진을 호출하는 브리지 역할만 수행
 */
import 'tsconfig-paths/register';

import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameRepository } from './game.repository';

// game-engine 라이브러리 (핵심 게임 규칙 모듈)
import { ScoreCalculatorService } from '@libs/game-engine/services/score-calculator.service';
import { DiceService } from '@libs/game-engine/services/dice.service';
import { TurnService } from '@libs/game-engine/services/turn.service';
import { GameFlowService } from '@libs/game-engine/services/game-flow.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [
    GameService,
    GameRepository,

    // game-engine 의존성 주입
    ScoreCalculatorService,
    DiceService,
    TurnService,
    GameFlowService,
  ],
  exports: [GameService],
})
export class GameModule {}
