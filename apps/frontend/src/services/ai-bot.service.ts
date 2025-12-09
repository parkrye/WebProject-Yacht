import type { ScoreCategory, ScoreCard } from '../types/game.types';
import { calculateScore } from './game-engine';

// 재미있는 AI 봇 이름들
const BOT_NAMES = [
  '카이지 봇',
  '도박왕 AI',
  '주사위의 신',
  '운빨 마스터',
  '야찌 고수',
  '럭키 봇',
  '다이스 킹',
  '행운의 여신',
  '확률 계산기',
  '도전자 AI',
];

const ALL_CATEGORIES: ScoreCategory[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'threeOfAKind', 'fourOfAKind', 'fullHouse',
  'smallStraight', 'largeStraight', 'choice', 'yacht'
];

export function getRandomBotName(existingNames: string[]): string {
  const availableNames = BOT_NAMES.filter(name => !existingNames.includes(name));
  if (availableNames.length === 0) {
    return `봇 ${Date.now() % 1000}`;
  }
  return availableNames[Math.floor(Math.random() * availableNames.length)];
}

export function isBot(playerId: string): boolean {
  return playerId.startsWith('bot_');
}

// AI가 유지할 주사위 결정
export function decideDiceToKeep(diceValues: number[]): boolean[] {
  const counts = new Map<number, number>();
  for (const v of diceValues) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  // 가장 많이 나온 숫자 찾기
  let maxCount = 0;
  let maxValue = 0;
  for (const [value, count] of counts.entries()) {
    if (count > maxCount || (count === maxCount && value > maxValue)) {
      maxCount = count;
      maxValue = value;
    }
  }

  // 3개 이상 같은 숫자가 있으면 그것들을 유지
  if (maxCount >= 3) {
    return diceValues.map(v => v === maxValue);
  }

  // 스트레이트 가능성 체크
  const sorted = [...new Set(diceValues)].sort((a, b) => a - b);
  if (sorted.length >= 4) {
    // 연속된 숫자들 유지
    const straights = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];
    for (const straight of straights) {
      const matching = straight.filter(v => diceValues.includes(v));
      if (matching.length >= 4) {
        return diceValues.map(v => matching.includes(v));
      }
    }
  }

  // 2개 이상 같은 숫자가 있으면 유지
  if (maxCount >= 2) {
    return diceValues.map(v => v === maxValue);
  }

  // 높은 숫자(5, 6) 유지
  return diceValues.map(v => v >= 5);
}

// AI가 최적의 카테고리 선택
export function chooseBestCategory(
  diceValues: number[],
  scoreCard: ScoreCard
): ScoreCategory {
  const availableCategories = ALL_CATEGORIES.filter(cat => {
    const score = scoreCard[cat];
    return score === null || score === undefined;
  });

  if (availableCategories.length === 0) {
    return 'ones'; // fallback
  }

  // 각 카테고리별 점수 계산
  const scores = availableCategories.map(cat => ({
    category: cat,
    score: calculateScore(cat, diceValues),
  }));

  // 높은 점수 우선, 같으면 상위 카테고리(야찌, 라지 스트레이트 등) 우선
  const priorityOrder: ScoreCategory[] = [
    'yacht', 'largeStraight', 'smallStraight', 'fullHouse',
    'fourOfAKind', 'threeOfAKind', 'choice',
    'sixes', 'fives', 'fours', 'threes', 'twos', 'ones'
  ];

  scores.sort((a, b) => {
    // 0점이 아닌 것 우선
    if (a.score > 0 && b.score === 0) return -1;
    if (a.score === 0 && b.score > 0) return 1;

    // 점수가 같으면 우선순위
    if (a.score === b.score) {
      return priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category);
    }

    // 점수 높은 것 우선
    return b.score - a.score;
  });

  return scores[0].category;
}

// AI 턴을 위한 딜레이 (자연스러움을 위해)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
