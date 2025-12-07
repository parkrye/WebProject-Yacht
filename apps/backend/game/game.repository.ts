// DB or In-memory 저장

/**
 * GameRepository
 * - 게임 상태의 저장/조회/갱신을 담당한다.
 * - 현재는 In-Memory 기반으로 구현되지만, DB로 변경될 수 있으므로
 *   외부에서 직접 상태를 수정할 수 없도록 캡슐화한다.
 * - 비즈니스 로직/점수 계산 로직은 절대 포함하지 않는다.
 */

import { Injectable } from '@nestjs/common';
import { GameState } from '@libs/game-engine/entities/game-state';

@Injectable()
export class GameRepository {
  /**
   * In-memory 저장소
   * key: gameId
   * value: GameState
   */
  private readonly gameStore: Map<string, GameState> = new Map();

  /**
   * 새 게임 저장
   */
  save(gameId: string, state: GameState): void {
    this.gameStore.set(gameId, state);
  }

  /**
   * 게임 조회
   */
  findById(gameId: string): GameState | null {
    return this.gameStore.get(gameId) ?? null;
  }

  /**
   * 존재 여부 확인
   */
  exists(gameId: string): boolean {
    return this.gameStore.has(gameId);
  }

  /**
   * 게임 상태 갱신
   * (불변 데이터 구조를 사용하는 것을 권장하나,
   *  외부 수정 방지를 위해 setter가 아닌 replace 방식 사용)
   */
  update(gameId: string, state: GameState): void {
    if (!this.exists(gameId)) {
      throw new Error(`Game not found: ${gameId}`);
    }
    this.gameStore.set(gameId, state);
  }

  /**
   * 게임 삭제 (게임 종료 후 메모리 해제 용도)
   */
  delete(gameId: string): void {
    this.gameStore.delete(gameId);
  }

  /**
   * 저장된 모든 게임 ID 조회 (옵션)
   * - 디버깅 및 상태 모니터링용
   */
  getAllGameIds(): string[] {
    return [...this.gameStore.keys()];
  }
}
