import type { GamePhase, Player } from '../../types/game.types';

interface GameStatusProps {
  phase: GamePhase;
  round: number;
  currentPlayer: Player | null;
  rollCount: number;
  maxRolls: number;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: '대기중',
  rolling: '진행중',
  scoring: '점수선택',
  finished: '게임종료',
};

export function GameStatus({
  phase,
  round,
  currentPlayer,
  rollCount,
  maxRolls,
}: GameStatusProps) {
  return (
    <div className="wood-frame p-2.5 sm:p-4 mb-2 sm:mb-4">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-wood-light">상태:</span>
          <span className="font-bold text-gold px-1.5 sm:px-2 py-0.5 sm:py-1 bg-wood-dark/50 rounded text-xs sm:text-sm">
            {PHASE_LABELS[phase]}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-wood-light">라운드:</span>
          <span className="font-bold text-white px-1.5 sm:px-2 py-0.5 sm:py-1 bg-wood-dark/50 rounded text-xs sm:text-sm">
            {round}/13
          </span>
        </div>
        {currentPlayer && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-wood-light">현재:</span>
            <span className="font-bold text-gold-light px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gold/20 rounded truncate max-w-[80px] sm:max-w-none text-xs sm:text-sm">
              {currentPlayer.name}
            </span>
          </div>
        )}
        {phase === 'rolling' && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-wood-light">굴림:</span>
            <div className="flex gap-0.5 sm:gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    n <= rollCount ? 'bg-gold' : 'bg-wood-dark/50'
                  }`}
                />
              ))}
            </div>
            <span className="text-white text-[10px] sm:text-xs">
              ({rollCount}/{maxRolls})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
