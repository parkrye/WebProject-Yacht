/**
 * Player
 * - 플레이어 기본 정보를 표현하는 엔티티
 * - 상태/점수/턴 로직을 포함하지 않고, 데이터 모델 역할만 수행한다 (SRP).
 */

export interface Player {
  /** 플레이어 고유 ID (UUID) */
  id: string;

  /** UI에 표시될 이름 */
  name: string;
}
