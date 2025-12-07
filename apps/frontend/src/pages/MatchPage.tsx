import { useState } from 'react';
import { Category } from '@/libs';
import { useGame } from '../hooks/useGame';
import { DiceView } from '../components/dice/DiceView';
import { Scoreboard } from '../components/scoreboard/Scoreboard';
import { GameStatus } from '../components/game-status/GameStatus';

export function MatchPage({ gameId, playerId }: { gameId: string; playerId: string }) {
  const { state, roll, select } = useGame(gameId);
  const [keep, setKeep] = useState<number[]>([]);

  if (!state) return <div>Loading...</div>;
  const myTurn = state.players[state.activePlayerIndex].id === playerId;

  const toggle = (idx: number) =>
    setKeep((prev) => (prev.includes(idx) ? prev.filter((v) => v !== idx) : [...prev, idx]));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <GameStatus state={state} />

      <DiceView
        dice={state.dice}
        onToggle={(i) => myTurn && toggle(i)}
      />

      {myTurn && (
        <button
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => roll(playerId, keep)}
        >
          Roll
        </button>
      )}

      <Scoreboard
        state={state}
        onSelect={(c) => myTurn && select(playerId, c as Category)}
      />
    </div>
  );
}
