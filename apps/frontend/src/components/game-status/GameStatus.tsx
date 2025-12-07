import { GameState } from '@/libs';

export function GameStatus({ state }: { state: GameState }) {
  const p = state.players[state.activePlayerIndex];
  return (
    <div className="text-lg font-semibold mt-3">
      Round {state.round + 1} ¡¤ Turn: {p.name}
      {state.isFinished && <span className="text-red-500 ml-2">Game Finished!</span>}
    </div>
  );
}
