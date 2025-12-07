# VS 바이브 코딩 ? Agent Rules (for AI development)
이 문서는 AI 코딩 에이전트가 코드를 생성·수정할 때 반드시 따라야 할 규칙이다.
모든 작업은 아래 기준을 준수해야 한다.

## 기술 스택 기준
본 프로젝트는 아래 기술을 기반으로 한다:
- Backend: NestJS
- Frontend: TypeScript
- Styling: Tailwind CSS
- DB / 기타 모듈은 변경될 수 있으나, 아키텍처 및 규칙 준수는 필수

## 개발 철학
- 유지보수성, 확장성, 단일 책임 원칙 중심의 작성
- 하드코딩을 지양하고 ? 설정 및 상수는 반드시 별도 파일로 관리
- 임시 해결책(TEMP FIX) 가능하나, 반드시 주석에 남기고 TODO 문서화
- 코드는 읽는 사람이 이해할 수 있게 작성한다

## 코드 스타일 & 구조

### 공통 규칙
- ealry return 사용
- 하드 코딩 금지
- SOLID 원칙 준수
- 직관적인 네이밍 사용
- 디버깅을 위한 상세한 로그 출력
- 200줄을 초과하는 긴 코드 구성 지양

### TypeScript
- 타입:	any 사용 금지
- 클래스/인터페이스: PascalCase
- 변수/함수: camelCase
- enum: PascalCase
- 파일명: kebab-case

#### 코드 스타일 예시
- BAD Case
    let data: any
- GOOD Case
    interface PlayerStatus { hp: number; combo: number }

### NestJS 규칙
- Controller: Request/Response 용도만 ? 비즈니스 로직 금지
- Service: 비즈니스 로직의 중심
- Repository: DB 직접 액세스 로직
- Module: 관심사별 분리 및 의존성 관리
- Controller ?> Service ?> Repository 흐름 불변
- 하나의 클래스가 두 가지 역할을 수행하지 않는다 (SRP 준수)

## SOLID 준수 기준
- 클래스/모듈은 단일 책임만
- 조건/분기보다는 확장 가능한 구조 우선
- 부모 타입을 바꾸지 않고 자식은 동일하게 동작
- 거대한 인터페이스 → 필요한 인터페이스만
- 구체 구현이 아닌 추상화에 의존

## 하드코딩 금지
- BAD Case
    if (combo > 30) damage *= 1.5
    -  내부 로직에서 직접 상수/문자열/숫자를 선언해 고정 값 사용
- GOOD Case
    import { COMBO_DAMAGE_TABLE } from '@/configs/combat.config';
    damage *= COMBO_DAMAGE_TABLE.getMultiplier(combo);
    - 모든 상수 ? API 키 ? 메시지 문자열 ? 설정값 → configs/ 또는 constants/로 분리

## Tailwind CSS 규칙
- 클래스: HTML 태그에 직접 선언
- 재사용: 중복 패턴 → @apply / 컴포넌트화
- 네이밍: 의미 기반 (btn-primary, text-danger)

### 예시
- BAD Case
<button class="bg-blue-500 text-white px-4 py-2 rounded">Play</button>
- GOOD Case
<button class="btn-primary">Play</button>

## 금지 목록
- 하드코딩: 수정 불가/확장성 고려
- any 남발: 타입 안정성 고려
- Controller 내 비즈니스 로직: 관심사 분리 실패
- 전역 변수: 예측 불가 동작
- 매직 넘버/매직 스트링: 의미 불명

## 목표
- 모든 코드가 다음을 만족해야 한다:
- 확장하기 쉬워야 한다
- 지우고 바꾸기 쉬워야 한다
- 읽기 쉬워야 한다
- 버그 발생 시 추적이 쉬워야 한다