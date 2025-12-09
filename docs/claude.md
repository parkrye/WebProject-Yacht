# CLAUDE.md - AI 개발 가이드

이 문서는 AI가 코드를 작성할 때 반드시 따라야 할 규칙입니다.

---

## 프로젝트 개요

**야찌(Yahtzee) 주사위 게임** 웹 애플리케이션

### 기술 스택
| 영역 | 기술 |
|------|------|
| Backend | NestJS (Node.js 프레임워크) |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Database | Firebase Realtime Database |
| 게임 로직 | libs/game-engine (공유 라이브러리) |

### 프로젝트 구조
```
apps/
  backend/     -> NestJS 서버 (API, 네트워크 처리)
  frontend/    -> React 클라이언트 (UI, 사용자 입력)
libs/
  game-engine/ -> 게임 규칙 핵심 로직
  entities/    -> 게임 데이터 모델 (Player, DiceSet 등)
  constants/   -> 상수값 (점수 테이블 등)
  services/    -> 게임 서비스 (주사위, 점수 계산 등)
  types/       -> 타입 정의
```

---

## 핵심 원칙

### 1. 유지보수성 우선
- 코드는 읽는 사람이 이해할 수 있게 작성
- 하드코딩 금지 -> 설정값은 configs/ 또는 constants/에 분리
- 임시 해결책(TEMP FIX)은 반드시 TODO 주석으로 표시

### 2. 확장성 고려
- SOLID 원칙 준수
- 하나의 클래스/함수는 하나의 책임만 가짐

---

## 코딩 규칙

### TypeScript
```typescript
// 금지: any 사용
let data: any  // X

// 권장: 명확한 타입 정의
interface PlayerStatus {  // O
  hp: number;
  combo: number;
}
```

| 항목 | 규칙 |
|------|------|
| 타입 | any 사용 금지 |
| 클래스/인터페이스 | PascalCase |
| 변수/함수 | camelCase |
| enum | PascalCase |
| 파일명 | kebab-case |

### 함수 작성
- Early Return 패턴 사용 (중첩 줄이기)
- 500줄 초과 금지 (파일 분리 필요)
- 의미있는 변수명 사용

### NestJS 아키텍처
```
Controller -> Service -> Repository
(요청/응답)   (비즈니스)   (DB 접근)
```

| 레이어 | 역할 |
|--------|------|
| Controller | HTTP 요청/응답 처리만 담당 |
| Service | 비즈니스 로직 처리 |
| Repository | 데이터베이스 접근 |
| Module | 기능별 분리 및 의존성 관리 |

### Tailwind CSS
```html
<!-- 금지: 인라인에 긴 클래스 나열 -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Play</button>

<!-- 권장: 의미있는 클래스로 추상화 -->
<button class="btn-primary">Play</button>
```

- 반복되는 스타일은 @apply로 컴포넌트화
- 클래스명은 의미 기반: btn-primary, text-danger

---

## 하드코딩 금지 예시
```typescript
// 금지
if (combo > 30) damage *= 1.5;

// 권장
import { COMBO_DAMAGE_TABLE } from '@/configs/combat.config';
damage *= COMBO_DAMAGE_TABLE.getMultiplier(combo);
```

다음은 반드시 설정 파일로 분리:
- 게임 상수 (점수, 배율 등)
- API 키
- 메시지 문자열
- 서버 설정값

---

## 금지 사항

| 항목 | 이유 |
|------|------|
| 하드코딩 | 수정 어려움, 확장성 저하 |
| any 타입 | 타입 안전성 훼손 |
| Controller에 비즈니스 로직 | 관심사 분리 위반 |
| 주석 없는 복잡한 로직 | 유지보수 어려움 |
| 의미 없는 변수명 (a, temp) | 가독성 저하 |

---

## 목표

모든 코드는 다음을 만족해야 합니다:
- 확장하기 쉬울 것
- 설정을 바꾸기 쉬울 것
- 읽기 쉬울 것
- 오류 발생 시 원인 파악이 쉬울 것

---

## 시스템 설계

### 게임 흐름
```
[게임 생성] -> [플레이어 참가] -> [게임 시작] -> [턴 진행] -> [게임 종료]
                                      |
                                      v
                            [주사위 굴리기 (최대 3회)]
                                      |
                                      v
                            [점수 카테고리 선택]
                                      |
                                      v
                            [다음 플레이어 턴]
```

### 데이터 모델

#### Player (플레이어)
```typescript
interface Player {
  id: string;
  name: string;
  scoreCard: ScoreCard;
  isCurrentTurn: boolean;
}
```

#### DiceSet (주사위 세트)
```typescript
interface DiceSet {
  values: number[];      // 5개 주사위 값 [1-6]
  kept: boolean[];       // 유지 여부
  rollCount: number;     // 현재 굴린 횟수 (최대 3)
}
```

#### ScoreCard (점수표)
```typescript
interface ScoreCard {
  // Upper Section
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;

  // Special Section
  threeOfAKind: number | null;
  fourOfAKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  choice: number | null;
  yacht: number | null;
}
```

#### GameState (게임 상태)
```typescript
interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  diceSet: DiceSet;
  phase: GamePhase;
  round: number;
}

enum GamePhase {
  WAITING = 'waiting',
  ROLLING = 'rolling',
  SCORING = 'scoring',
  FINISHED = 'finished'
}
```

### 점수 계산 규칙

| 카테고리 | 조건 | 점수 계산 |
|----------|------|-----------|
| Ones ~ Sixes | 해당 숫자 주사위 | 해당 숫자의 합 |
| Three of a Kind | 같은 숫자 3개+ | 해당 숫자 x 3 |
| Four of a Kind | 같은 숫자 4개+ | 해당 숫자 x 4 |
| Full House | 3개 + 2개 조합 | 모든 주사위 합 |
| Small Straight | 연속 4개 | 연속된 4개 합 |
| Large Straight | 연속 5개 | 모든 주사위 합 |
| Choice | 제한 없음 | 모든 주사위 합 |
| Yacht | 5개 동일 | 50점 (고정) |

### API 설계

#### Game API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /game | 새 게임 생성 |
| GET | /game/:id | 게임 상태 조회 |
| POST | /game/:id/join | 게임 참가 |
| POST | /game/:id/start | 게임 시작 |

#### Turn API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /game/:id/roll | 주사위 굴리기 |
| POST | /game/:id/keep | 주사위 유지 설정 |
| POST | /game/:id/score | 점수 카테고리 선택 |

### 파일 구조 상세

```
libs/
├── types/
│   ├── player.type.ts
│   ├── dice.type.ts
│   ├── score.type.ts
│   ├── game.type.ts
│   └── index.ts
├── constants/
│   ├── game.constants.ts      # MAX_PLAYERS, MAX_ROLLS 등
│   ├── score.constants.ts     # YACHT_SCORE, 카테고리 목록
│   └── index.ts
├── entities/
│   ├── player.entity.ts
│   ├── dice-set.entity.ts
│   ├── score-card.entity.ts
│   ├── game-state.entity.ts
│   └── index.ts
├── services/
│   ├── dice.service.ts        # 주사위 굴리기
│   ├── score-calculator.service.ts  # 점수 계산
│   ├── turn.service.ts        # 턴 관리
│   └── index.ts
├── game-engine/
│   ├── game-engine.ts         # 게임 로직 통합
│   └── index.ts
└── configs/
    └── firebase.config.ts

apps/backend/
├── game/
│   ├── game.module.ts
│   ├── game.controller.ts
│   ├── game.service.ts
│   └── game.repository.ts     # Firebase 연동
├── player/
│   ├── player.module.ts
│   ├── player.controller.ts
│   └── player.service.ts
└── main.ts

apps/frontend/
├── components/
│   ├── dice/
│   │   └── DiceView.tsx       # 주사위 표시
│   ├── scoreboard/
│   │   └── Scoreboard.tsx     # 점수표
│   ├── game-status/
│   │   └── GameStatus.tsx     # 게임 상태
│   └── turn-actions/
│       └── TurnActions.tsx    # 턴 액션 버튼
├── pages/
│   └── GamePage.tsx
├── hooks/
│   └── useGame.ts
├── services/
│   └── api.service.ts
├── stores/
│   └── game.store.ts          # Zustand
└── styles/
    └── globals.css
```

### Firebase 데이터 구조

```
/games
  /{gameId}
    /state: GameState
    /players
      /{playerId}: Player
    /history
      /{turnId}: TurnRecord
```

---

## UI 디자인 시스템

### 디자인 컨셉: Casino Table

고급 카지노 테이블의 분위기를 재현한 디자인입니다.
- **나무 프레임**: 따뜻한 브라운 톤의 나무 질감
- **붉은 펠트**: 카지노 테이블의 붉은 천 느낌
- **골드 악센트**: 고급스러운 금색 하이라이트

### 컬러 팔레트

```
┌──────────────────────────────────────────────────────────┐
│  COLOR PALETTE                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Wood (나무)                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │      │ │      │ │      │ │      │                    │
│  │ #d4a │ │ #8b5 │ │ #5c3 │ │ #3d2 │                    │
│  │ 574  │ │ a2b  │ │ a21  │ │ 516  │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│   light   DEFAULT   dark    darker                      │
│                                                          │
│  Felt (펠트)                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │      │ │      │ │      │ │      │                    │
│  │ #c94 │ │ #8b2 │ │ #5c1 │ │ #3d0 │                    │
│  │ a4a  │ │ 323  │ │ 515  │ │ e0e  │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│   light   DEFAULT   dark    darker                      │
│                                                          │
│  Gold (골드)                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐                             │
│  │      │ │      │ │      │                             │
│  │ #ffd │ │ #daa │ │ #b88 │                             │
│  │ 700  │ │ 520  │ │ 60b  │                             │
│  └──────┘ └──────┘ └──────┘                             │
│   light   DEFAULT   dark                                │
│                                                          │
│  Dice (주사위)                                           │
│  ┌──────┐ ┌──────┐                                      │
│  │      │ │      │                                      │
│  │ #f5f │ │ #1a1 │                                      │
│  │ 5dc  │ │ a1a  │                                      │
│  └──────┘ └──────┘                                      │
│   bg      dot                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Tailwind 커스텀 설정

```javascript
// tailwind.config.js
colors: {
  wood: {
    light: '#d4a574',
    DEFAULT: '#8b5a2b',
    dark: '#5c3a21',
    darker: '#3d2516',
  },
  felt: {
    light: '#c94a4a',
    DEFAULT: '#8b2323',
    dark: '#5c1515',
    darker: '#3d0e0e',
  },
  gold: {
    light: '#ffd700',
    DEFAULT: '#daa520',
    dark: '#b8860b',
  },
  dice: {
    bg: '#f5f5dc',
    dot: '#1a1a1a',
  },
},
```

### 커스텀 컴포넌트 클래스

```css
/* Wood Frame - 나무 테두리 패널 */
.wood-frame {
  @apply bg-wood shadow-wood rounded-lg border-4 border-wood-dark;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.05) 2px,
    rgba(0, 0, 0, 0.05) 4px
  );
}

/* Felt Table - 카지노 펠트 표면 */
.felt-table {
  @apply bg-felt shadow-felt rounded-lg;
  background-image: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 70%
  );
}

/* Primary Button - 골드 버튼 */
.btn-primary {
  @apply px-6 py-3 bg-gold text-wood-darker font-bold rounded-lg
         shadow-lg hover:bg-gold-light active:bg-gold-dark
         transition-all duration-200 uppercase tracking-wider;
}

/* Secondary Button - 나무 버튼 */
.btn-secondary {
  @apply px-4 py-2 bg-wood text-white font-bold rounded-lg
         shadow-md hover:bg-wood-light active:bg-wood-dark
         transition-all duration-200;
}
```

### UI 컴포넌트 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║                     YACHT DICE                            ║  │
│  ║                                              Game ID: xxx ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Status: In Progress | Round: 3/12 | Current: Player 1   │   │
│  │ Rolls: ●●○ (2/3)                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║                        DICE                             ║   │
│  ║  ┌─────────────────────────────────────────────────┐    ║   │
│  ║  │  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐            │    ║   │
│  ║  │  │ ⚁ │  │ ⚃ │  │ ⚀ │  │ ⚅ │  │ ⚂ │            │    ║   │
│  ║  │  └───┘  └───┘  └───┘  └───┘  └───┘            │    ║   │
│  ║  │          KEEP           KEEP                   │    ║   │
│  ║  └─────────────────────────────────────────────────┘    ║   │
│  ║                 Click dice to keep/unkeep               ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    Roll the dice or select a score category.            │   │
│  │                  [ ROLL DICE ]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ╔═════════════════════════════════════════════════════════╗   │
│  ║                    SCORE CARD                           ║   │
│  ╠═════════════════════════════════════════════════════════╣   │
│  ║ Category          │ Player1 ★ │ Player2   │ Player3    ║   │
│  ╠═════════════════════════════════════════════════════════╣   │
│  ║ ▶ UPPER SECTION                                         ║   │
│  ║ Ones              │     3      │     -     │     2      ║   │
│  ║ Twos              │     6      │     4     │     -      ║   │
│  ║ ...               │    ...     │    ...    │    ...     ║   │
│  ║ Bonus (63+=35pts) │   12/63    │   8/63    │   6/63     ║   │
│  ╠═════════════════════════════════════════════════════════╣   │
│  ║ ▶ LOWER SECTION                                         ║   │
│  ║ Three of a Kind   │    [15]    │     -     │    12      ║   │
│  ║ Full House        │     -      │    25     │     -      ║   │
│  ║ ...               │    ...     │    ...    │    ...     ║   │
│  ╠═════════════════════════════════════════════════════════╣   │
│  ║ TOTAL             │    127     │    98     │    85      ║   │
│  ╚═════════════════════════════════════════════════════════╝   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

범례:
- ★ : 현재 턴인 플레이어
- [숫자] : 선택 가능한 점수 (깜빡임 효과)
- ● : 사용한 굴리기 횟수
- ○ : 남은 굴리기 횟수
```

### 주사위 디자인

```
 주사위 구조 (3x3 그리드 기반)

 ┌─────────────────┐
 │  0,0  0,1  0,2  │     ⚀ = (1,1)
 │  1,0  1,1  1,2  │     ⚁ = (0,0), (2,2)
 │  2,0  2,1  2,2  │     ⚂ = (0,0), (1,1), (2,2)
 └─────────────────┘     ⚃ = (0,0), (0,2), (2,0), (2,2)
                         ⚄ = (0,0), (0,2), (1,1), (2,0), (2,2)
                         ⚅ = (0,0), (0,2), (1,0), (1,2), (2,0), (2,2)

 상태별 스타일:
 ┌─────────┐       ┌─────────┐
 │ DEFAULT │       │  KEPT   │
 │ bg-dice │       │ bg-amber│
 │ shadow  │       │ ring-4  │
 │         │       │ ring-gold
 │  [⚃]   │       │  [⚃]   │
 │         │       │  KEEP   │
 └─────────┘       └─────────┘
```

### 반응형 디자인

```
Desktop (1024px+):
┌────────────────────────────────────────┐
│  Header                                │
│  ┌──────────────────────────────────┐  │
│  │         Dice Area                │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │        Score Card                │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────┐
│ Header (compact) │
├──────────────────┤
│ Status (wrap)    │
├──────────────────┤
│ Dice (smaller)   │
├──────────────────┤
│ Actions          │
├──────────────────┤
│ Score Card       │
│ (scrollable)     │
└──────────────────┘
```

### 애니메이션 효과

| 요소 | 효과 | 용도 |
|------|------|------|
| 주사위 hover | scale-105 | 클릭 가능 표시 |
| KEEP 배지 | 골드 링 + glow | 유지 상태 강조 |
| 선택가능 점수 | animate-pulse | 선택 유도 |
| 버튼 | transition-all 200ms | 부드러운 인터랙션 |
| 로딩 | spin animation | 처리 중 표시 |

### 접근성 고려사항

- 색상 대비: WCAG AA 기준 준수
- 버튼 최소 크기: 44x44px (터치 친화적)
- 시각적 피드백: hover, focus, active 상태 명확히 구분
- 상태 표시: 아이콘 + 텍스트 병행