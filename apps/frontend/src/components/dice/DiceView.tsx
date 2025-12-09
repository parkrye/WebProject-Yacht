interface DiceViewProps {
  values: number[];
  kept: boolean[];
  onToggleKeep: (index: number) => void;
  disabled: boolean;
}

const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

function SingleDice({
  value,
  isKept,
  onClick,
  disabled,
}: {
  value: number;
  isKept: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const dots = DICE_DOTS[value] || [];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-16 rounded-lg relative cursor-pointer
        transition-all duration-200 transform
        ${
          isKept
            ? 'bg-amber-100 ring-4 ring-gold shadow-dice-kept scale-105'
            : 'bg-dice-bg shadow-dice hover:scale-105'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
    >
      <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-0.5">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`
                  flex items-center justify-center
                  ${hasDot ? 'visible' : 'invisible'}
                `}
              >
                {hasDot && (
                  <div className="w-2.5 h-2.5 bg-dice-dot rounded-full" />
                )}
              </div>
            );
          })
        )}
      </div>
      {isKept && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gold bg-wood-dark px-1.5 py-0.5 rounded">
          KEEP
        </span>
      )}
    </button>
  );
}

export function DiceView({
  values,
  kept,
  onToggleKeep,
  disabled,
}: DiceViewProps) {
  return (
    <div className="wood-frame p-4">
      <h3 className="text-gold text-lg font-bold mb-3 text-center">
        Dice
      </h3>
      <div className="felt-table p-6 flex justify-center gap-4">
        {values.map((value, index) => (
          <SingleDice
            key={index}
            value={value}
            isKept={kept[index]}
            onClick={() => onToggleKeep(index)}
            disabled={disabled}
          />
        ))}
      </div>
      <p className="text-center text-sm text-wood-light mt-2">
        Click dice to keep/unkeep
      </p>
    </div>
  );
}
