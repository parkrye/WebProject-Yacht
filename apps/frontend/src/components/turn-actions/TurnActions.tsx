import type { GamePhase } from '../../types/game.types';

interface TurnActionsProps {
  phase: GamePhase;
  canRoll: boolean;
  isMyTurn: boolean;
  onRoll: () => void;
  onStartGame: () => void;
  isLoading: boolean;
  playerCount: number;
  isHost: boolean;
}

export function TurnActions({
  phase,
  canRoll,
  isMyTurn,
  onRoll,
  onStartGame,
  isLoading,
  playerCount,
  isHost,
}: TurnActionsProps) {
  if (phase === 'waiting') {
    return (
      <div className="wood-frame p-6 text-center">
        <p className="text-wood-light mb-4">
          플레이어를 추가하고 게임을 시작하세요.
        </p>
        {isHost ? (
          <button
            className="btn-primary"
            onClick={onStartGame}
            disabled={isLoading || playerCount < 1}
          >
            {isLoading ? '시작 중...' : '게임 시작'}
          </button>
        ) : (
          <p className="text-gold/70 text-sm">방장이 게임을 시작하길 기다리는 중...</p>
        )}
      </div>
    );
  }

  if (phase === 'finished') {
    return null;
  }

  if (phase === 'rolling') {
    return (
      <div className="wood-frame p-4 text-center">
        {isMyTurn ? (
          <>
            <p className="text-wood-light mb-3">
              {canRoll
                ? '주사위를 굴리거나 점수 카테고리를 선택하세요.'
                : '점수 카테고리를 선택하여 턴을 종료하세요.'}
            </p>
            {canRoll && (
              <button
                className="btn-primary text-lg px-8 py-4"
                onClick={onRoll}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    굴리는 중...
                  </span>
                ) : (
                  '주사위 굴리기'
                )}
              </button>
            )}
          </>
        ) : (
          <p className="text-wood-light/70">다른 플레이어의 턴입니다...</p>
        )}
      </div>
    );
  }

  return null;
}
