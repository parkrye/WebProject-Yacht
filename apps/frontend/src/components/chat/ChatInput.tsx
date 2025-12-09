import { useState } from 'react';

// 카테고리별 메시지 (6개 카테고리, 각 6개 메시지)
const CHAT_CATEGORIES = {
  praise: {
    label: '칭찬',
    emoji: '👏',
    messages: ['잘했어!', '대박!', '좋아요', '멋져요', '최고!', 'ㄷㄷ'],
  },
  taunt: {
    label: '도발',
    emoji: '😈',
    messages: ['그게 다야?', '겁쟁이~', '한번 더!', '에이~', '운빨ㅋ', '별로네'],
  },
  cheer: {
    label: '응원',
    emoji: '🔥',
    messages: ['화이팅!', '가즈아!', '힘내!', '파이팅', '할수있어', '믿어요'],
  },
  reaction: {
    label: '반응',
    emoji: '😮',
    messages: ['와...', 'ㅋㅋㅋ', '헐', '오오', '대박', '실화?'],
  },
  greeting: {
    label: '인사',
    emoji: '👋',
    messages: ['안녕!', 'ㅎㅇ', '반가워', '잘부탁', 'ㄱㄱ', '시작!'],
  },
  emotion: {
    label: '감정',
    emoji: '😢',
    messages: ['아쉽다', '슬퍼요', '행복해', '긴장돼', '떨려요', '졸려...'],
  },
};

type CategoryKey = keyof typeof CHAT_CATEGORIES;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

// 6개 배치: 상좌, 상우, 좌, 우, 하좌, 하우
const HEXAGONAL_POSITIONS = [
  { x: -32, y: -55 },  // 상좌 (1)
  { x: 32, y: -55 },   // 상우 (2)
  { x: -60, y: 0 },    // 좌 (3)
  { x: 60, y: 0 },     // 우 (4)
  { x: -32, y: 55 },   // 하좌 (5)
  { x: 32, y: 55 },    // 하우 (6)
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const handleSend = (message: string) => {
    onSend(message);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category: CategoryKey) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setSelectedCategory(null);
    } else {
      setIsOpen(true);
    }
  };

  const categories = Object.entries(CHAT_CATEGORIES) as [CategoryKey, typeof CHAT_CATEGORIES[CategoryKey]][];

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-40">
      {/* 메뉴 컨테이너 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[180px] h-[180px] flex items-center justify-center">
          {/* 중앙 취소 버튼 */}
          <button
            onClick={handleBack}
            className="absolute w-10 h-10 rounded-full bg-wood-dark/95 border-2 border-wood-light/50 hover:border-gold text-wood-light hover:text-gold transition-all flex items-center justify-center shadow-lg active:scale-95 z-10"
            style={{ right: '70px', bottom: '70px' }}
          >
            {selectedCategory ? '←' : '✕'}
          </button>

          {/* 카테고리 또는 메시지 버튼들 (6개) */}
          {!selectedCategory ? (
            // 카테고리 선택 화면
            categories.map(([key, category], index) => {
              const pos = HEXAGONAL_POSITIONS[index];
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  disabled={disabled}
                  className="absolute w-11 h-11 rounded-full bg-wood-dark/95 backdrop-blur-sm border-2 border-gold/50 hover:border-gold hover:bg-wood/90 transition-all flex flex-col items-center justify-center shadow-lg active:scale-95 disabled:opacity-50"
                  style={{
                    right: `${90 - 22 - pos.x}px`,
                    bottom: `${90 - 22 - pos.y}px`,
                  }}
                >
                  <span className="text-sm">{category.emoji}</span>
                  <span className="text-[8px] text-gold leading-none">{category.label}</span>
                </button>
              );
            })
          ) : (
            // 메시지 선택 화면 (6개)
            CHAT_CATEGORIES[selectedCategory].messages.map((message, index) => {
              const pos = HEXAGONAL_POSITIONS[index];
              return (
                <button
                  key={index}
                  onClick={() => handleSend(message)}
                  disabled={disabled}
                  className="absolute px-2 py-1 rounded-lg bg-wood-dark/95 backdrop-blur-sm border border-gold/30 hover:border-gold hover:bg-wood/90 transition-all text-[11px] text-wood-light hover:text-gold shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  style={{
                    right: `${90 - pos.x}px`,
                    bottom: `${90 - pos.y}px`,
                    transform: 'translate(50%, 50%)',
                  }}
                >
                  {message}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* 메인 채팅 버튼 */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-12 h-12 rounded-full
          bg-gold/90 hover:bg-gold
          text-wood-darker font-bold text-xl
          shadow-lg
          transition-all active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
          ${isOpen ? 'ring-2 ring-gold-light' : ''}
        `}
      >
        💬
      </button>
    </div>
  );
}
