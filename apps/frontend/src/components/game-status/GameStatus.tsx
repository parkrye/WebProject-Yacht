import type { GamePhase, Player } from '../../types/game.types';

interface GameStatusProps {
  phase: GamePhase;
  round: number;
  currentPlayer: Player | null;
  rollCount: number;
  maxRolls: number;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  waiting: 'Waiting',
  rolling: 'In Progress',
  scoring: 'Select Score',
  finished: 'Game Over',
};

export function GameStatus({
  phase,
  round,
  currentPlayer,
  rollCount,
  maxRolls,
}: GameStatusProps) {
  return (
    <div className="wood-frame p-4 mb-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-wood-light">Status:</span>
          <span className="font-bold text-gold px-2 py-1 bg-wood-dark/50 rounded">
            {PHASE_LABELS[phase]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-wood-light">Round:</span>
          <span className="font-bold text-white px-2 py-1 bg-wood-dark/50 rounded">
            {round} / 13
          </span>
        </div>
        {currentPlayer && (
          <div className="flex items-center gap-2">
            <span className="text-wood-light">Current:</span>
            <span className="font-bold text-gold-light px-2 py-1 bg-gold/20 rounded">
              {currentPlayer.name}
            </span>
          </div>
        )}
        {phase === 'rolling' && (
          <div className="flex items-center gap-2">
            <span className="text-wood-light">Rolls:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-3 h-3 rounded-full ${
                    n <= rollCount ? 'bg-gold' : 'bg-wood-dark/50'
                  }`}
                />
              ))}
            </div>
            <span className="text-white text-xs">
              ({rollCount}/{maxRolls})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
