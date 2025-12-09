import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface ChatBubbleProps {
  messages: ChatMessage[];
  currentPlayerId: string;
}

// 정해진 멘트 목록
export const CHAT_MESSAGES = [
  '훌륭한 판단입니다!',
  '그걸로 만족하시나요?',
  '한 번 더 가죠!',
  '운이 좋네요!',
  '아쉽네요...',
  '대박!',
  '잘했어요!',
  '화이팅!',
  '좋은 선택!',
  '다음엔 더 잘할 거예요',
  '야찌!',
  '믿고 있었어요',
  '이건 운명이야',
  '가즈아!',
  'ㅋㅋㅋ',
];

export function ChatBubble({ messages, currentPlayerId }: ChatBubbleProps) {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // 새 메시지가 오면 visible에 추가
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const alreadyVisible = visibleMessages.some(m => m.id === latestMessage.id);

      if (!alreadyVisible) {
        setVisibleMessages(prev => [...prev, latestMessage]);

        // 3초 후 메시지 제거
        setTimeout(() => {
          setVisibleMessages(prev => prev.filter(m => m.id !== latestMessage.id));
        }, 3000);
      }
    }
  }, [messages]);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-28 right-2 sm:right-4 z-40 flex flex-col gap-2 max-w-[200px] sm:max-w-[250px] pointer-events-none">
      {visibleMessages.map((msg) => {
        const isMe = msg.playerId === currentPlayerId;
        return (
          <div
            key={msg.id}
            className={`
              animate-fade-in-up
              bg-wood-dark/90 backdrop-blur-sm
              px-3 py-2 rounded-lg shadow-lg
              border border-gold/30
              ${isMe ? 'ml-auto' : 'mr-auto'}
            `}
          >
            <p className="text-gold text-[10px] sm:text-xs font-semibold mb-0.5 truncate">
              {msg.playerName}
            </p>
            <p className="text-white text-xs sm:text-sm">
              {msg.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
