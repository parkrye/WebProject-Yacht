import type { ScoreCategory, ScoreCard } from '../types/game.types';
import { calculateScore } from './game-engine';

// AI 파라미터 인터페이스
export interface AIParams {
  aggression: number;  // 공격성 (0~10): 높을수록 높은 점수를 위해 위험 감수
  caution: number;     // 신중함 (0~10): 높을수록 판단까지 대기 시간이 길어짐
  mistake: number;     // 실수 (0~10): 높을수록 잘못된 선택을 할 확률 증가
}

// AI 봇 정보 (이름 + 파라미터)
export interface AIBot {
  name: string;
  params: AIParams;
}

// 재미있는 AI 봇 프리셋들
const BOT_PRESETS: AIBot[] = [
  {
    name: '신중한 계산기',
    params: { aggression: 2, caution: 8, mistake: 1 }
  },
  {
    name: '도박왕 AI',
    params: { aggression: 9, caution: 3, mistake: 3 }
  },
  {
    name: '주사위의 신',
    params: { aggression: 7, caution: 5, mistake: 0 }
  },
  {
    name: '운빨 마스터',
    params: { aggression: 10, caution: 2, mistake: 5 }
  },
  {
    name: '야찌 고수',
    params: { aggression: 6, caution: 6, mistake: 2 }
  },
  {
    name: '럭키 봇',
    params: { aggression: 5, caution: 4, mistake: 4 }
  },
  {
    name: '다이스 킹',
    params: { aggression: 8, caution: 4, mistake: 1 }
  },
  {
    name: '행운의 여신',
    params: { aggression: 4, caution: 7, mistake: 3 }
  },
  {
    name: '확률 계산기',
    params: { aggression: 3, caution: 9, mistake: 0 }
  },
  {
    name: '도전자 AI',
    params: { aggression: 7, caution: 3, mistake: 6 }
  },
];

// AI 파라미터 저장소 (botId -> AIParams)
const botParamsMap = new Map<string, AIParams>();

const ALL_CATEGORIES: ScoreCategory[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'threeOfAKind', 'fourOfAKind', 'fullHouse',
  'smallStraight', 'largeStraight', 'choice', 'yacht'
];

export function getRandomBot(existingNames: string[]): AIBot {
  const availableBots = BOT_PRESETS.filter(bot => !existingNames.includes(bot.name));
  if (availableBots.length === 0) {
    // 랜덤 파라미터로 새 봇 생성
    return {
      name: `봇 ${Date.now() % 1000}`,
      params: {
        aggression: Math.floor(Math.random() * 11),
        caution: Math.floor(Math.random() * 11),
        mistake: Math.floor(Math.random() * 11),
      }
    };
  }
  return availableBots[Math.floor(Math.random() * availableBots.length)];
}

// 기존 함수 유지 (호환성)
export function getRandomBotName(existingNames: string[]): string {
  return getRandomBot(existingNames).name;
}

export function isBot(playerId: string): boolean {
  return playerId.startsWith('bot_');
}

// AI 파라미터 등록
export function registerBotParams(botId: string, params: AIParams): void {
  botParamsMap.set(botId, params);
}

// AI 파라미터 가져오기
export function getBotParams(botId: string): AIParams {
  return botParamsMap.get(botId) ?? { aggression: 5, caution: 5, mistake: 3 };
}

// 신중함에 따른 대기 시간 계산 (ms)
export function calculateThinkingTime(caution: number): number {
  // 기본 500ms + 신중함에 따라 최대 2000ms 추가 + 랜덤 변동
  const baseTime = 500;
  const cautionTime = caution * 200; // 0~2000ms
  const randomVariation = Math.random() * 500 - 250; // -250 ~ +250ms
  return Math.max(300, baseTime + cautionTime + randomVariation);
}

// 실수 여부 결정
function shouldMakeMistake(mistakeLevel: number): boolean {
  // 실수 레벨에 따른 확률 (0=0%, 10=50%)
  const mistakeChance = mistakeLevel * 0.05;
  return Math.random() < mistakeChance;
}

// AI가 유지할 주사위 결정 (파라미터 적용) - 스코어카드 고려
export function decideDiceToKeep(
  diceValues: number[],
  params: AIParams = { aggression: 5, caution: 5, mistake: 3 },
  scoreCard?: ScoreCard
): boolean[] {
  const { aggression, mistake } = params;

  // 실수: 일부 주사위 킵 상태를 랜덤하게 결정
  if (shouldMakeMistake(mistake)) {
    console.log('[AI] 실수 발생: 주사위 킵을 랜덤하게 결정');
    return diceValues.map(() => Math.random() > 0.5);
  }

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

  // 야찌! 모든 주사위 유지
  if (maxCount === 5) {
    return [true, true, true, true, true];
  }

  // 4개 같은 숫자: 야찌 시도
  if (maxCount === 4) {
    return diceValues.map(v => v === maxValue);
  }

  // 3개 이상 같은 숫자가 있으면 그것들을 유지
  if (maxCount >= 3) {
    // 스코어카드가 있으면, 야찌나 포카인드 가능한지 확인
    if (scoreCard) {
      const fourOfKindAvailable = scoreCard.fourOfAKind === null || scoreCard.fourOfAKind === undefined;
      const yachtAvailable = scoreCard.yacht === null || scoreCard.yacht === undefined;

      // 야찌나 포카인드 가능하면 계속 모으기
      if (yachtAvailable || fourOfKindAvailable) {
        return diceValues.map(v => v === maxValue);
      }
    }
    return diceValues.map(v => v === maxValue);
  }

  // 풀하우스 가능성 체크: 2+2 조합
  const pairs = Array.from(counts.entries()).filter(([, c]) => c >= 2);
  if (pairs.length >= 2 && scoreCard) {
    const fullHouseAvailable = scoreCard.fullHouse === null || scoreCard.fullHouse === undefined;
    if (fullHouseAvailable) {
      // 두 개의 페어 모두 유지
      const pairValues = pairs.map(([v]) => v);
      return diceValues.map(v => pairValues.includes(v));
    }
  }

  // 스트레이트 가능성 체크
  const uniqueValues = [...new Set(diceValues)].sort((a, b) => a - b);
  if (uniqueValues.length >= 4) {
    const straights = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
    ];

    // 스코어카드 확인
    const largeStraightAvailable = !scoreCard || scoreCard.largeStraight === null || scoreCard.largeStraight === undefined;
    const smallStraightAvailable = !scoreCard || scoreCard.smallStraight === null || scoreCard.smallStraight === undefined;

    if (largeStraightAvailable || smallStraightAvailable) {
      for (const straight of straights) {
        const matching = straight.filter(v => uniqueValues.includes(v));
        if (matching.length >= 4) {
          // 스트레이트에 필요한 숫자만 유지 (중복 제거)
          const keep = new Set(matching);
          const result = diceValues.map(() => false);
          for (let i = 0; i < diceValues.length; i++) {
            if (keep.has(diceValues[i])) {
              result[i] = true;
              keep.delete(diceValues[i]); // 중복 방지
            }
          }
          return result;
        }
      }
    }
  }

  // 2개 이상 같은 숫자가 있으면 유지
  if (maxCount >= 2) {
    // 스코어카드 고려: 해당 상단 카테고리가 남았으면 높은 숫자 선호
    if (scoreCard && pairs.length > 0) {
      // 사용 가능한 상단 카테고리 중 가장 높은 숫자의 페어 선택
      let bestPairValue = maxValue;
      for (const [value] of pairs) {
        const upperCat = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'][value - 1] as ScoreCategory;
        const isAvailable = scoreCard[upperCat] === null || scoreCard[upperCat] === undefined;
        if (isAvailable && value > bestPairValue) {
          bestPairValue = value;
        }
      }
      return diceValues.map(v => v === bestPairValue);
    }

    // 공격적인 AI: 높은 숫자 쌍 선호
    if (aggression >= 6) {
      const bestPair = pairs.reduce((a, b) => a[0] > b[0] ? a : b);
      return diceValues.map(v => v === bestPair[0]);
    }
    return diceValues.map(v => v === maxValue);
  }

  // 페어가 없는 경우: 높은 숫자 유지 (상단 카테고리 고려)
  if (scoreCard) {
    // 아직 채우지 않은 상단 카테고리 중 현재 주사위에 있는 가장 높은 숫자
    for (let num = 6; num >= 1; num--) {
      const upperCat = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'][num - 1] as ScoreCategory;
      const isAvailable = scoreCard[upperCat] === null || scoreCard[upperCat] === undefined;
      if (isAvailable && diceValues.includes(num)) {
        return diceValues.map(v => v === num);
      }
    }
  }

  // 기본: 높은 숫자(5, 6) 유지
  const hasHighNumbers = diceValues.some(v => v >= 5);
  if (hasHighNumbers) {
    return diceValues.map(v => v >= 5);
  }

  // 아무것도 유지하지 않음
  return [false, false, false, false, false];
}

// 상단 카테고리 목록
const UPPER_CATEGORIES: ScoreCategory[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

// 각 상단 카테고리의 목표 숫자
const UPPER_TARGET: Record<string, number> = {
  ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6
};

// 상단 카테고리의 기댓값 (3개 이상 나올 확률 고려)
// 5개 주사위로 특정 숫자 N개 이상 나올 기댓값 ≈ N * (5/6) * (1/6)^0 ... 복잡하므로 간단히 계산
// 평균적으로 각 숫자는 5/6 ≈ 0.833개 나옴, 기댓값 = 숫자 * 0.833 * 3회 기회 고려
const UPPER_EXPECTED: Record<string, number> = {
  ones: 2.5,    // 1 * 2.5개 평균
  twos: 5,      // 2 * 2.5
  threes: 7.5,  // 3 * 2.5
  fours: 10,    // 4 * 2.5
  fives: 12.5,  // 5 * 2.5
  sixes: 15     // 6 * 2.5
};

// 상단 보너스 진행 상황 계산
function calculateUpperProgress(scoreCard: ScoreCard): { remaining: number; needed: number } {
  let currentTotal = 0;
  let filledCount = 0;

  for (const cat of UPPER_CATEGORIES) {
    const score = scoreCard[cat];
    if (score !== null && score !== undefined) {
      currentTotal += score;
      filledCount++;
    }
  }

  const remaining = 6 - filledCount;
  const needed = Math.max(0, 63 - currentTotal);

  return { remaining, needed };
}

// 상단 카테고리가 보너스에 기여하는 정도 평가
function evaluateUpperCategoryValue(
  category: ScoreCategory,
  currentScore: number,
  scoreCard: ScoreCard
): number {
  if (!UPPER_CATEGORIES.includes(category)) return 0;

  const target = UPPER_TARGET[category];
  const expected = UPPER_EXPECTED[category];
  const { remaining, needed } = calculateUpperProgress(scoreCard);

  // 이미 보너스 달성했거나 불가능한 경우
  if (needed === 0) return currentScore; // 보너스 이미 달성
  if (remaining === 0) return currentScore;

  // 현재 점수가 기댓값 대비 어떤지
  const scoreRatio = currentScore / expected;

  // 기댓값보다 높으면 보너스 점수, 낮으면 패널티
  let bonusValue = 0;
  if (scoreRatio >= 1.0) {
    // 기댓값 이상 = 보너스 달성에 기여
    bonusValue = (currentScore - expected) * 0.5; // 초과분의 50% 가치
  } else if (currentScore >= target * 3) {
    // 목표 숫자 3개 이상 = 기본 달성
    bonusValue = 0;
  } else {
    // 기댓값 미달 = 보너스 달성 위험
    bonusValue = (currentScore - expected) * 0.3; // 미달분의 30% 패널티
  }

  return currentScore + bonusValue;
}

// 0점 희생 시 최적의 카테고리 찾기
function findBestSacrificeCategory(
  diceValues: number[],
  scoreCard: ScoreCard
): ScoreCategory | null {
  const counts = new Map<number, number>();
  for (const v of diceValues) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  // 현재 주사위에 없거나 1개만 있는 상단 카테고리 찾기
  const sacrificeCandidates: { category: ScoreCategory; opportunity: number }[] = [];

  for (const cat of UPPER_CATEGORIES) {
    if (scoreCard[cat] !== null && scoreCard[cat] !== undefined) continue;

    const target = UPPER_TARGET[cat];
    const count = counts.get(target) ?? 0;
    const currentScore = calculateScore(cat, diceValues);

    // 현재 0점이고, 다른 좋은 카테고리가 있는 경우 희생 후보
    if (currentScore === 0 || count <= 1) {
      // 기댓값 대비 손실 계산
      const expectedLoss = UPPER_EXPECTED[cat] - currentScore;
      sacrificeCandidates.push({ category: cat, opportunity: expectedLoss });
    }
  }

  // 기댓값 손실이 가장 적은 카테고리 선택 (낮은 숫자 우선)
  sacrificeCandidates.sort((a, b) => a.opportunity - b.opportunity);

  return sacrificeCandidates.length > 0 ? sacrificeCandidates[0].category : null;
}

// AI가 최적의 카테고리 선택 (파라미터 적용) - 개선된 버전
export function chooseBestCategory(
  diceValues: number[],
  scoreCard: ScoreCard,
  params: AIParams = { aggression: 5, caution: 5, mistake: 3 }
): ScoreCategory {
  const { mistake } = params;

  const availableCategories = ALL_CATEGORIES.filter(cat => {
    const score = scoreCard[cat];
    return score === null || score === undefined;
  });

  if (availableCategories.length === 0) {
    return 'ones'; // fallback
  }

  // 실수: 랜덤한 카테고리 선택
  if (shouldMakeMistake(mistake)) {
    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    console.log('[AI] 실수 발생: 랜덤 카테고리 선택 -', randomCategory);
    return randomCategory;
  }

  // 각 카테고리별 점수 및 가치 계산
  const categoryValues = availableCategories.map(cat => {
    const score = calculateScore(cat, diceValues);
    let value = score;

    // 상단 카테고리: 보너스 진행 상황 고려
    if (UPPER_CATEGORIES.includes(cat)) {
      value = evaluateUpperCategoryValue(cat, score, scoreCard);
    }

    // 특수 카테고리 가치 조정
    if (cat === 'yacht' && score === 50) {
      value = 60; // 야찌는 매우 높은 가치
    } else if (cat === 'largeStraight' && score === 30) {
      value = 35; // 라지 스트레이트도 높은 가치
    } else if (cat === 'fullHouse' && score > 0) {
      value = score + 5; // 풀하우스 보너스
    }

    return { category: cat, score, value };
  });

  // 최고 점수 확인
  const maxScore = Math.max(...categoryValues.map(cv => cv.score));

  // 좋은 점수가 있는 경우 (15점 이상)
  if (maxScore >= 15) {
    // 가치 기준 정렬
    categoryValues.sort((a, b) => b.value - a.value);
    return categoryValues[0].category;
  }

  // 좋은 점수가 없는 경우: 희생 전략 고려
  // 예: 111346에서 Ones(1점)과 Sixes(6점) 중 Sixes 기댓값이 높으므로 Ones 희생
  const bestPositiveScore = categoryValues.find(cv => cv.score > 0);

  if (maxScore <= 6 && bestPositiveScore) {
    // 낮은 점수만 있는 경우, 희생할 카테고리 탐색
    const sacrificeCategory = findBestSacrificeCategory(diceValues, scoreCard);

    if (sacrificeCategory && availableCategories.includes(sacrificeCategory)) {
      const sacrificeScore = calculateScore(sacrificeCategory, diceValues);

      // 희생 카테고리의 현재 점수가 낮고, 다른 카테고리 점수도 낮으면 희생
      // 예: ones=1, sixes=6 → ones 희생 (sixes 기댓값 15 > ones 기댓값 2.5)
      if (sacrificeScore <= 3 && UPPER_EXPECTED[sacrificeCategory] < UPPER_EXPECTED[bestPositiveScore.category]) {
        console.log(`[AI] 희생 전략: ${sacrificeCategory}(${sacrificeScore}점)을 희생하여 ${bestPositiveScore.category} 보존`);
        return sacrificeCategory;
      }
    }
  }

  // 0점 카테고리가 있고 어쩔 수 없이 0점을 넣어야 하는 경우
  const zeroScoreCategories = categoryValues.filter(cv => cv.score === 0);
  if (zeroScoreCategories.length === availableCategories.length) {
    // 모든 카테고리가 0점인 경우, 기댓값이 가장 낮은 카테고리에 0점
    const lowerCategories = zeroScoreCategories.filter(cv =>
      ['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'].includes(cv.category)
    );

    if (lowerCategories.length > 0) {
      // 하단 카테고리 중 달성 어려운 것 먼저 희생
      const priorityOrder = ['yacht', 'largeStraight', 'fullHouse', 'fourOfAKind', 'smallStraight', 'threeOfAKind'];
      lowerCategories.sort((a, b) =>
        priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category)
      );
      return lowerCategories[0].category;
    }

    // 상단만 남은 경우, 가장 낮은 숫자 카테고리에 0점
    zeroScoreCategories.sort((a, b) => {
      const aTarget = UPPER_TARGET[a.category] ?? 7;
      const bTarget = UPPER_TARGET[b.category] ?? 7;
      return aTarget - bTarget;
    });
    return zeroScoreCategories[0].category;
  }

  // 일반적인 경우: 가치 기준 정렬
  categoryValues.sort((a, b) => {
    // 0점은 최후 순위
    if (a.score > 0 && b.score === 0) return -1;
    if (a.score === 0 && b.score > 0) return 1;

    // 가치 기준
    return b.value - a.value;
  });

  return categoryValues[0].category;
}

// AI가 추가 굴림을 할지 결정 (파라미터 적용)
export function shouldRollAgain(
  diceValues: number[],
  rollCount: number,
  scoreCard: ScoreCard,
  params: AIParams = { aggression: 5, caution: 5, mistake: 3 }
): boolean {
  const { aggression, mistake } = params;

  // 이미 3번 굴렸으면 불가
  if (rollCount >= 3) return false;

  // 실수: 불필요한 재굴림
  if (shouldMakeMistake(mistake) && rollCount < 3) {
    console.log('[AI] 실수 발생: 불필요한 재굴림 시도');
    return true;
  }

  // 현재 최고 점수 계산
  const bestScore = Math.max(
    ...ALL_CATEGORIES.filter(cat => scoreCard[cat] === null || scoreCard[cat] === undefined)
      .map(cat => calculateScore(cat, diceValues))
  );

  // 야찌가 있으면 굴리지 않음
  if (diceValues.every(v => v === diceValues[0])) {
    return false;
  }

  // 공격적인 AI: 높은 점수를 위해 더 굴림
  if (aggression >= 7) {
    // 30점 이상이면 만족
    if (bestScore >= 30) return false;
    return rollCount < 3;
  }

  // 보수적인 AI: 적당한 점수면 만족
  if (aggression <= 3) {
    // 15점 이상이면 만족
    if (bestScore >= 15) return false;
    // 첫 굴림이면 한 번 더
    return rollCount < 2;
  }

  // 중간: 20점 이상이면 만족
  if (bestScore >= 20) return false;

  // 기본적으로 2~3번 굴림
  return rollCount < 2 + Math.floor(Math.random() * 2);
}

// AI 턴을 위한 딜레이 (자연스러움을 위해)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// AI 채팅 메시지 카테고리별 목록 (6개 카테고리, 각 6개 메시지)
const AI_CHAT_MESSAGES = {
  praise: ['잘했어!', '대박!', '좋아요', '멋져요', '최고!', 'ㄷㄷ'],
  taunt: ['그게 다야?', '겁쟁이~', '한번 더!', '에이~', '운빨ㅋ', '별로네'],
  cheer: ['화이팅!', '가즈아!', '힘내!', '파이팅', '할수있어', '믿어요'],
  reaction: ['와...', 'ㅋㅋㅋ', '헐', '오오', '대박', '실화?'],
  greeting: ['안녕!', 'ㅎㅇ', '반가워', '잘부탁', 'ㄱㄱ', '시작!'],
  emotion: ['아쉽다', '슬퍼요', '행복해', '긴장돼', '떨려요', '졸려...'],
};

export type AIChatContext = 'turnStart' | 'goodRoll' | 'badRoll' | 'scoreSelect' | 'opponentTurn';

// AI가 채팅을 보낼지 결정 (파라미터 기반)
export function shouldAISendChat(params: AIParams, context: AIChatContext): boolean {
  const { aggression, caution } = params;

  // 기본 확률: 20%
  let baseChance = 0.2;

  // 공격적인 AI: 도발 메시지를 더 자주 보냄
  if (aggression >= 7) {
    baseChance += 0.15;
  }

  // 신중한 AI: 채팅을 덜 함
  if (caution >= 7) {
    baseChance -= 0.1;
  }

  // 상황별 확률 조정
  switch (context) {
    case 'goodRoll':
      baseChance += 0.1; // 좋은 결과에 더 반응
      break;
    case 'badRoll':
      baseChance += 0.05;
      break;
    case 'scoreSelect':
      baseChance += 0.05;
      break;
    case 'opponentTurn':
      baseChance -= 0.05; // 상대 턴에는 덜 반응
      break;
  }

  return Math.random() < Math.max(0.05, Math.min(0.4, baseChance));
}

// AI가 보낼 메시지 선택 (파라미터 기반)
export function chooseAIChatMessage(params: AIParams, context: AIChatContext): string {
  const { aggression } = params;

  // 상황과 성향에 따른 카테고리 선택
  let category: keyof typeof AI_CHAT_MESSAGES;

  switch (context) {
    case 'goodRoll':
      // 좋은 결과: 공격적이면 도발, 아니면 반응
      category = aggression >= 6 ? 'taunt' : 'reaction';
      break;
    case 'badRoll':
      // 나쁜 결과: 감정 표현
      category = 'emotion';
      break;
    case 'scoreSelect':
      // 점수 선택: 공격적이면 도발, 아니면 칭찬
      category = aggression >= 7 ? 'taunt' : 'praise';
      break;
    case 'opponentTurn':
      // 상대 턴: 공격적이면 도발, 아니면 응원
      category = aggression >= 6 ? 'taunt' : 'cheer';
      break;
    case 'turnStart':
    default:
      // 턴 시작: 인사 또는 응원
      category = Math.random() > 0.5 ? 'greeting' : 'cheer';
      break;
  }

  const messages = AI_CHAT_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}
