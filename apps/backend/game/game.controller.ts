// HTTP/Websocket 입출력

/**
 * GameController
 * - HTTP/WebSocket 요청을 받아 GameService에 전달한다.
 * - 컨트롤러 내부에서 게임 규칙/점수 계산 로직을 구현하지 않는다.
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import {
  CreateGameRequestDto,
  RollDiceRequestDto,
  SelectCategoryRequestDto,
} from './dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * 새로운 게임 생성
   * - 플레이어 목록을 받아 게임을 생성한다.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createGame(@Body() dto: CreateGameRequestDto) {
    return this.gameService.createGame(dto);
  }

  /**
   * 현재 게임 상태 조회
   * - UI는 이 API를 사용하여 현재의 턴, 주사위 값, 점수표 등을 표시한다.
   */
  @Get(':gameId')
  getGameState(@Param('gameId') gameId: string) {
    return this.gameService.getGameState(gameId);
  }

  /**
   * 주사위 굴림 요청 (플레이어의 턴)
   * - 몇 번째 굴림인지, 고정(keep)할 주사위 인덱스는 서비스에서 검증/처리
   */
  @Post(':gameId/roll')
  @HttpCode(HttpStatus.OK)
  rollDice(
    @Param('gameId') gameId: string,
    @Body() dto: RollDiceRequestDto,
  ) {
    return this.gameService.rollDice(gameId, dto);
  }

  /**
   * 점수 카테고리 선택
   * - 플레이어가 현재 굴림 상태를 어떤 점수 카테고리에 기록할지 선택
   * - 실제 점수 계산 및 기록은 서비스 → game-engine에서 수행
   */
  @Post(':gameId/select-category')
  @HttpCode(HttpStatus.OK)
  selectCategory(
    @Param('gameId') gameId: string,
    @Body() dto: SelectCategoryRequestDto,
  ) {
    return this.gameService.selectCategory(gameId, dto);
  }

  /**
   * 게임 종료 여부 확인 (선택적)
   * - UI가 End 화면을 띄울 시점 판단을 위해 사용
   */
  @Get(':gameId/is-finished')
  @HttpCode(HttpStatus.OK)
  isFinished(@Param('gameId') gameId: string) {
    return this.gameService.isGameFinished(gameId);
  }
}
