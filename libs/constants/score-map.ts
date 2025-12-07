// (카테고리 명/설명/표시 텍스트 등)

/**
 * score-map.ts
 * - 점수 카테고리 관련 상수/설명/표시 텍스트를 통합 관리하는 파일
 * - 하드코딩을 피하고 UI/로직에서 공통으로 활용할 수 있도록 설계
 */

import { Category } from '../types/category.enum';

export interface ScoreCategoryMeta {
  label: string;          // UI 표시용 이름
  description: string;    // 설명 (툴팁/가이드용)
  group: 'UPPER' | 'SPECIAL';
}

export const SCORE_CATEGORY_MAP: Record<Category, ScoreCategoryMeta> = {
  // ----- Upper Section -----
  [Category.Ones]: {
    label: 'Ones',
    description: '주사위 중 숫자 1의 합계',
    group: 'UPPER',
  },
  [Category.Twos]: {
    label: 'Twos',
    description: '주사위 중 숫자 2의 합계',
    group: 'UPPER',
  },
  [Category.Threes]: {
    label: 'Threes',
    description: '주사위 중 숫자 3의 합계',
    group: 'UPPER',
  },
  [Category.Fours]: {
    label: 'Fours',
    description: '주사위 중 숫자 4의 합계',
    group: 'UPPER',
  },
  [Category.Fives]: {
    label: 'Fives',
    description: '주사위 중 숫자 5의 합계',
    group: 'UPPER',
  },
  [Category.Sixes]: {
    label: 'Sixes',
    description: '주사위 중 숫자 6의 합계',
    group: 'UPPER',
  },

  // ----- Special Section -----
  [Category.ThreeOfKind]: {
    label: 'Three of a Kind',
    description: '같은 숫자가 3개 이상 ? 해당 세 숫자의 합 기록',
    group: 'SPECIAL',
  },
  [Category.FourOfKind]: {
    label: 'Four of a Kind',
    description: '같은 숫자가 4개 이상 ? 해당 네 숫자의 합 기록',
    group: 'SPECIAL',
  },
  [Category.FullHouse]: {
    label: 'Full House',
    description: '3개 + 2개 조합 ? 전체 다섯 주사위 합 기록',
    group: 'SPECIAL',
  },
  [Category.SmallStraight]: {
    label: 'Small Straight',
    description: '연속된 숫자 4개 (1?4 / 2?5 / 3?6) ? 연속 4개의 합 기록',
    group: 'SPECIAL',
  },
  [Category.LargeStraight]: {
    label: 'Large Straight',
    description: '연속된 숫자 5개 (1?5 또는 2?6) ? 다섯 주사위 합 기록',
    group: 'SPECIAL',
  },
  [Category.Choice]: {
    label: 'Choice',
    description: '가리지 않음 ? 다섯 주사위의 합 기록',
    group: 'SPECIAL',
  },
  [Category.Yacht]: {
    label: 'Yacht',
    description: '다섯 개가 모두 같은 숫자 ? 50점 고정',
    group: 'SPECIAL',
  },
};

/**
 * 카테고리 순서
 * 점수표 UI 렌더링 또는 정렬에서 사용
 */
export const SCORE_CATEGORY_ORDER: Category[] = [
  Category.Ones,
  Category.Twos,
  Category.Threes,
  Category.Fours,
  Category.Fives,
  Category.Sixes,

  Category.ThreeOfKind,
  Category.FourOfKind,
  Category.FullHouse,
  Category.SmallStraight,
  Category.LargeStraight,
  Category.Choice,
  Category.Yacht,
];
