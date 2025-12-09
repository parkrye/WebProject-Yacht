import type { GamePhase } from '../../types/game.types';

interface TurnActionsProps {
  phase: GamePhase;
  canRoll: boolean;
  onRoll: () => void;
  onStartGame: () => void;
  isLoading: boolean;
  playerCount: number;
}

export function TurnActions({
  phase,
  canRoll,
  onRoll,
  onStartGame,
  isLoading,
  playerCount,
}: TurnActionsProps) {
  if (phase === 'waiting') {
    return (
      <div className="wood-frame p-6 text-center">
        <p className="text-wood-light mb-4">
          Add players and start the game when ready.
        </p>
        <button
          className="btn-primary"
          onClick={onStartGame}
          disabled={isLoading || playerCount < 1}
        >
          {isLoading ? 'Starting...' : 'Start Game'}
        </button>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="wood-frame p-6 text-center">
        <p className="text-gold text-xl font-bold">Game Over!</p>
      </div>
    );
  }

  if (phase === 'rolling') {
    return (
      <div className="wood-frame p-4 text-center">
        <p className="text-wood-light mb-3">
          {canRoll
            ? 'Roll the dice or select a score category.'
            : 'Select a score category to end your turn.'}
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
                Rolling...
              </span>
            ) : (
              'Roll Dice'
            )}
          </button>
        )}
      </div>
    );
  }

  return null;
}
