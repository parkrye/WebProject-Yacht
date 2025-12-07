/**
 * GameState
 * - 게임 전체의 현재 상태 스냅샷을 저장하는 엔티티
 * - 비즈니스 계산/진행 로직은 포함하지 않고, 데이터 구조만 표현한다 (SRP).
 */

import { Player } from './player';
import { DiceSet } from './dice-set';
import { Scorecard } from './scoreCard';

export interface GameState {
  gameId: string;

  /** 플레이어 목록 */
  players: Player[];

  /** 현재 차례인 플레이어 index (0 ~ players.length - 1) */
  activePlayerIndex: number;

  /** 현재 라운드 (0부터 시작 ? 게임 엔진에서 관리) */
  round: number;

  /** 현재 주사위 상태 */
  dice: DiceSet;

  /** 현재 롤 횟수 (0 = 아직 안 굴림, 1 = 첫 굴림 완료, 최대 3) */
  rollCount: number;

  /** 점수표 (플레이어별) */
  scorecard: Scorecard;

  /** 게임 종료 여부 ? 모든 카테고리가 채워지면 true */
  isFinished: boolean;

  /** 생성/갱신 시간 ? 리플레이/로그 용 (옵션) */
  updatedAt: number;
}
