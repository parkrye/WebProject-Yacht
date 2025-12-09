interface TurnTimerProps {
  timeLeft: number;
  maxTime: number;
  show: boolean;
}

export function TurnTimer({ timeLeft, maxTime, show }: TurnTimerProps) {
  if (!show) return null;

  const percentage = (timeLeft / maxTime) * 100;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="w-full">
      {/* 타이머 바 */}
      <div className="relative h-2 bg-wood-dark/50 rounded-full overflow-hidden">
        <div
          className={`
            absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-linear
            ${isCritical ? 'bg-red-500 animate-pulse' : isUrgent ? 'bg-yellow-500' : 'bg-gold'}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 남은 시간 텍스트 */}
      <div className="flex justify-between items-center mt-1">
        <span className={`text-xs ${isCritical ? 'text-red-400 font-bold' : isUrgent ? 'text-yellow-400' : 'text-wood-light'}`}>
          {isCritical ? '시간 없음!' : isUrgent ? '서둘러주세요!' : '남은 시간'}
        </span>
        <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400 animate-pulse' : isUrgent ? 'text-yellow-400' : 'text-gold'}`}>
          {timeLeft}초
        </span>
      </div>
    </div>
  );
}
