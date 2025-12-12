# Yacht Dice Game

멀티플레이어 온라인 야찌(Yacht) 주사위 게임

## 목차

1. [게임 플레이 가이드](#게임-플레이-가이드)
2. [프로젝트 구성 가이드](#프로젝트-구성-가이드)

---

# 게임 플레이 가이드
게임 URL: **https://yacht-dice-game.web.app**

## 게임 소개

Yacht Dice는 5개의 주사위를 굴려 다양한 조합을 만들어 점수를 획득하는 전략 주사위 게임입니다.

- **플레이어**: 1~4명
- **목표**: 13라운드 동안 점수표를 채워 가장 높은 점수 획득
- **AI 대전**: 혼자서도 AI 봇과 대전 가능

## 게임 시작하기

### 1. 홈 화면
- 닉네임을 입력하고 "로비 입장" 버튼을 클릭합니다.
- 닉네임은 최대 10자까지 가능합니다.

### 2. 로비
- **새 방 만들기**: 새로운 게임 방을 생성합니다.
- **방 코드로 입장**: 5자리 방 코드를 입력하여 특정 방에 참여합니다.
- **대기 중인 방 목록**: 참여 가능한 방 목록이 실시간으로 표시됩니다.

### 3. 게임 대기실
- 방장은 AI 봇을 추가하거나 게임을 시작할 수 있습니다.
- AI 난이도: 쉬움, 보통, 어려움
- 최소 1명 이상이면 게임 시작 가능합니다.

## 게임 규칙

### 턴 진행

1. **주사위 굴리기**: 자신의 턴에 "주사위 굴리기" 버튼을 클릭합니다.
2. **주사위 유지**: 유지하고 싶은 주사위를 탭하면 "KEEP" 표시가 됩니다.
3. **재굴림**: 유지하지 않은 주사위만 다시 굴릴 수 있습니다 (최대 3회).
4. **점수 선택**: 점수표에서 원하는 카테고리를 선택하여 점수를 기록합니다.

### 점수 카테고리

#### 상단 섹션 (Ones ~ Sixes)

| 카테고리 | 점수 계산 |
|----------|-----------|
| Ones (1) | 1의 개수 x 1 |
| Twos (2) | 2의 개수 x 2 |
| Threes (3) | 3의 개수 x 3 |
| Fours (4) | 4의 개수 x 4 |
| Fives (5) | 5의 개수 x 5 |
| Sixes (6) | 6의 개수 x 6 |

> **보너스**: 상단 섹션 합계가 63점 이상이면 +35점 보너스!

#### 하단 섹션 (Special)

| 카테고리 | 조건 | 점수 |
|----------|------|------|
| Three of a Kind | 같은 숫자 3개+ | 해당 숫자 x 3 |
| Four of a Kind | 같은 숫자 4개+ | 해당 숫자 x 4 |
| Full House | 3개 + 2개 조합 | 모든 주사위 합 |
| Small Straight | 연속 4개 | 15점 |
| Large Straight | 연속 5개 | 30점 |
| Choice | 조건 없음 | 모든 주사위 합 |
| Yacht | 5개 모두 동일 | 50점 |

### 점수 예시

```
주사위: [4, 4, 4, 2, 6]
- Fours 선택 시: 4 x 3 = 12점
- Three of a Kind 선택 시: 4 x 3 = 12점
- Choice 선택 시: 4+4+4+2+6 = 20점

주사위: [6, 6, 6, 6, 6]
- Yacht 선택 시: 50점!
```

## UI 기능

### 채팅
- 우측 하단의 말풍선 버튼을 탭합니다.
- 6개 카테고리 (칭찬, 도발, 응원, 반응, 인사, 감정)에서 빠른 메시지를 선택할 수 있습니다.

### 사운드
- 좌측 상단에서 BGM과 효과음을 개별적으로 조절할 수 있습니다.

### 게임 나가기
- 좌측 상단의 "← 로비" 버튼을 클릭하면 게임을 나갈 수 있습니다.

---

# 프로젝트 구성 가이드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Backend | NestJS (Node.js) |
| Database | Firebase Realtime Database |
| Build Tool | Vite |
| Deployment | Firebase Hosting |

## 프로젝트 구조

```
VibeCodingWebProject/
├── apps/
│   ├── backend/                 # NestJS 서버
│   │   ├── game/               # 게임 관련 API
│   │   │   ├── game.controller.ts
│   │   │   ├── game.module.ts
│   │   │   └── dto/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   └── frontend/               # React 클라이언트
│       ├── src/
│       │   ├── components/     # UI 컴포넌트
│       │   │   ├── dice/       # 주사위 표시
│       │   │   ├── scoreboard/ # 점수표
│       │   │   ├── chat/       # 채팅 시스템
│       │   │   ├── audio-control/
│       │   │   └── ...
│       │   ├── pages/          # 페이지 컴포넌트
│       │   │   ├── HomePage.tsx
│       │   │   ├── LobbyPage.tsx
│       │   │   └── GamePage.tsx
│       │   ├── services/       # 비즈니스 로직
│       │   │   ├── game-engine.ts    # 게임 규칙 엔진
│       │   │   ├── ai-bot.service.ts # AI 봇 로직
│       │   │   ├── firebase.service.ts
│       │   │   └── audio.service.ts
│       │   ├── stores/         # Zustand 상태 관리
│       │   │   ├── game.store.ts
│       │   │   └── audio.store.ts
│       │   ├── types/          # TypeScript 타입 정의
│       │   └── styles/         # 글로벌 스타일
│       ├── public/             # 정적 파일 (오디오 등)
│       └── dist/               # 빌드 결과물
│
├── docs/                       # 문서
│   ├── CLAUDE.md              # AI 개발 가이드
│   └── game_rules.md          # 게임 규칙 상세
│
└── firebase.json              # Firebase 설정
```

## 주요 모듈 설명

### Frontend

#### 게임 엔진 (`game-engine.ts`)
- `calculateScore()`: 점수 계산 함수 (단일 소스)
- `GameEngine` 클래스: 게임 상태 관리, 턴 진행, 점수 기록

#### AI 봇 (`ai-bot.service.ts`)
- `decideDiceToKeep()`: 유지할 주사위 결정
- `decideScoreCategory()`: 점수 카테고리 선택
- 상단 보너스(63점) 달성을 위한 전략적 의사결정
- 기대값 기반 알고리즘

#### 상태 관리 (`game.store.ts`)
- Zustand 기반 전역 상태 관리
- Firebase Realtime Database와 실시간 동기화
- AI 봇 자동 플레이 처리

### 데이터 모델

```typescript
interface GameState {
  id: string;
  hostId: string;
  players: Player[];
  currentPlayerIndex: number;
  diceSet: DiceSet;
  phase: GamePhase; // 'waiting' | 'rolling' | 'finished'
  round: number;
}

interface Player {
  id: string;
  name: string;
  scoreCard: ScoreCard;
}

interface DiceSet {
  values: number[];     // [1-6, 1-6, 1-6, 1-6, 1-6]
  kept: boolean[];      // 유지 상태
  rollCount: number;    // 현재 굴린 횟수 (최대 3)
}
```

## 개발 환경 설정

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 루트 의존성 설치
npm install

# Frontend 의존성 설치
cd apps/frontend
npm install
```

### 환경 변수 설정

`apps/frontend/.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 실행

```bash
# Frontend 개발 서버
cd apps/frontend
npm run dev

# Frontend 빌드
npm run build

# Firebase 배포
npx firebase deploy
```

## 디자인 시스템

### 컬러 팔레트

| 용도 | 색상 | Hex |
|------|------|-----|
| Wood (나무) | 브라운 | #8b5a2b |
| Felt (펠트) | 레드 | #8b2323 |
| Gold (골드) | 골드 | #daa520 |
| Dice BG | 아이보리 | #f5f5dc |

### 커스텀 CSS 클래스

- `.wood-frame`: 나무 테두리 패널
- `.felt-table`: 카지노 펠트 표면
- `.btn-primary`: 골드 버튼
- `.btn-secondary`: 나무 버튼

## 라이선스

MIT License

---

Made with Vibe Coding
