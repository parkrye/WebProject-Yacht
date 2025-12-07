import { DiceSet } from '@/libs';

export function DiceView({
  dice,
  onToggle,
}: {
  dice: DiceSet;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {dice.values.map((v, idx) => (
        <button
          key={idx}
          onClick={() => onToggle(idx)}
          className={`w-12 h-12 rounded text-xl font-bold border
            ${dice.keep[idx] ? 'bg-yellow-300' : 'bg-white'}
          `}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
