/**
 * Category
 * - 점수 계산과 Scorecard에서 사용하는 공식 카테고리 열거형
 * - 문자열 하드코딩을 피하고, 내부 코드와 UI표기를 분리하여 확장 가능하게 설계.
 */
export enum Category {
  Ones = 'ONES',
  Twos = 'TWOS',
  Threes = 'THREES',
  Fours = 'FOURS',
  Fives = 'FIVES',
  Sixes = 'SIXES',

  ThreeOfKind = 'THREE_OF_KIND',
  FourOfKind = 'FOUR_OF_KIND',
  FullHouse = 'FULL_HOUSE',
  SmallStraight = 'SMALL_STRAIGHT',
  LargeStraight = 'LARGE_STRAIGHT',
  Choice = 'CHOICE',
  Yacht = 'YACHT',
}

/**
 * 카테고리 UI 표시용 텍스트 (i18n / Tailwind UI 컴포넌트에서 사용)
 * - 내부 로직에는 사용하지 않는다.
 * - 각국 번역 파일에서 override 가능하도록 기본 값만 제공.
 */
export const CATEGORY_LABEL_MAP: Record<Category, string> = {
  [Category.Ones]: '1s',
  [Category.Twos]: '2s',
  [Category.Threes]: '3s',
  [Category.Fours]: '4s',
  [Category.Fives]: '5s',
  [Category.Sixes]: '6s',

  [Category.ThreeOfKind]: 'Three of a Kind',
  [Category.FourOfKind]: 'Four of a Kind',
  [Category.FullHouse]: 'Full House',
  [Category.SmallStraight]: 'Small Straight',
  [Category.LargeStraight]: 'Large Straight',
  [Category.Choice]: 'Choice',
  [Category.Yacht]: 'Yacht',
};

/**
 * 카테고리 정렬 우선순위
 * - 점수판 렌더링 테이블에서 사용
 * - 점수 계산/엔진 로직에서 사용 ?
 */
export const CATEGORY_ORDER: Category[] = [
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
