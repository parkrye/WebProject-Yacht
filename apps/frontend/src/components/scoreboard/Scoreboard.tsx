import { CATEGORY_ORDER, CATEGORY_LABEL_MAP } from '@/libs';
import { GameState } from '@/libs';

export function Scoreboard({
  state,
  onSelect,
}: {
  state: GameState;
  onSelect: (category: string) => void;
}) {
  return (
    <table className="w-full mt-4 border">
      <tbody>
        {CATEGORY_ORDER.map((c) => {
          const entry = state.scorecard[c];
          return (
            <tr key={c} className="border-b">
              <td className="p-2">{CATEGORY_LABEL_MAP[c]}</td>
              <td className="p-2 text-right">{entry.filled ? entry.score : '-'}</td>
              <td className="p-2 text-right">
                {!entry.filled && (
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onSelect(c)}
                  >
                    Select
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
