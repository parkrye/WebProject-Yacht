import { useState, useEffect, useRef } from 'react';

interface DiceViewProps {
  values: number[];
  kept: boolean[];
  onToggleKeep: (index: number) => void;
  disabled: boolean;
  isRolling?: boolean;
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
  isRolling,
}: {
  value: number;
  isKept: boolean;
  onClick: () => void;
  disabled: boolean;
  isRolling: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 킵된 주사위는 애니메이션 안 함
    if (isRolling && !isKept) {
      // 빠르게 숫자 바꾸기 (50ms 간격)
      intervalRef.current = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 50);
    } else {
      // 롤링 끝나면 실제 값으로 설정
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplayValue(value);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRolling, isKept, value]);

  // 값이 0이거나 유효하지 않으면 6으로 표시 (항상 1-6 사이의 면만 보여야 함)
  const safeValue = displayValue >= 1 && displayValue <= 6 ? displayValue : 6;
  const dots = DICE_DOTS[safeValue];

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRolling}
      className={`
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg relative cursor-pointer
        transition-all duration-200 transform
        ${
          isKept
            ? 'bg-amber-100 ring-2 sm:ring-4 ring-gold shadow-dice-kept scale-105'
            : 'bg-dice-bg shadow-dice hover:scale-105'
        }
        ${disabled || isRolling ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}
        ${isRolling && !isKept ? 'animate-dice-shake' : ''}
      `}
    >
      <div className="absolute inset-1.5 sm:inset-2 grid grid-cols-3 grid-rows-3 gap-0.5">
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
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-dice-dot rounded-full" />
                )}
              </div>
            );
          })
        )}
      </div>
      {isKept && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-bold text-gold bg-wood-dark px-1 sm:px-1.5 py-0.5 rounded">
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
  isRolling = false,
}: DiceViewProps) {
  return (
    <div className="wood-frame p-2.5 sm:p-4">
      <h3 className="text-gold text-base sm:text-lg font-bold mb-2 sm:mb-3 text-center">
        Dice
      </h3>
      <div className="felt-table p-3 sm:p-6 flex justify-center gap-2 sm:gap-4">
        {values.map((value, index) => (
          <SingleDice
            key={index}
            value={value}
            isKept={kept[index]}
            onClick={() => onToggleKeep(index)}
            disabled={disabled}
            isRolling={isRolling}
          />
        ))}
      </div>
      <p className="text-center text-xs sm:text-sm text-wood-light mt-1.5 sm:mt-2">
        주사위를 탭하여 유지
      </p>
    </div>
  );
}
