/**
 * Scorecard
 * - 플레이어별 점수판을 구성하는 데이터 모델
 * - 점수 계산 및 검증 로직은 포함하지 않고, 점수 저장/조회 역할만 수행 (SRP).
 */

import { Category } from '../types/category.enum';

export interface ScoreEntry {
  /** 점수가 확정되어 존재하는 경우 */
  score: number | null;

  /** 이미 기록된 카테고리라면 true */
  filled: boolean;
}

export type Scorecard = Record<Category, ScoreEntry>;
