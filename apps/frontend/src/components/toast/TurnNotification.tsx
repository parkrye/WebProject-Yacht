import { useState, useEffect } from 'react';

interface TurnNotificationProps {
  show: boolean;
  onHide: () => void;
}

export function TurnNotification({ show, onHide }: TurnNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);

      // 0.8초 후 자동으로 사라짐 (짧게 확인만)
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onHide();
        }, 200); // 애니메이션 완료 후
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark px-8 py-4 rounded-lg shadow-2xl border-2 border-gold-light">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-bounce">🎲</span>
          <div className="text-center">
            <p className="text-wood-darker font-bold text-xl">
              당신의 차례입니다!
            </p>
            <p className="text-wood-dark text-sm">
              주사위를 굴려주세요
            </p>
          </div>
          <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎲</span>
        </div>
      </div>
    </div>
  );
}
