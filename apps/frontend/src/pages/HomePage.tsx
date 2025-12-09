import { useState, useEffect } from 'react';
import { AudioControl } from '../components';
import { useAudioStore } from '../stores/audio.store';

const STORAGE_KEY_NICKNAME = 'yacht_nickname';

interface HomePageProps {
  onEnterLobby: (nickname: string) => void;
}

export function HomePage({ onEnterLobby }: HomePageProps) {
  const [nickname, setNickname] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { playSfx, playBGM } = useAudioStore();

  // 저장된 닉네임 불러오기 및 메인 BGM 재생
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NICKNAME);
    if (saved) {
      setNickname(saved);
    }
    // 메인 BGM 재생
    playBGM('main');
  }, [playBGM]);

  const handleEnter = () => {
    if (!nickname.trim()) return;

    // 닉네임 저장
    localStorage.setItem(STORAGE_KEY_NICKNAME, nickname.trim());

    playSfx('button-click');
    onEnterLobby(nickname.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nickname.trim()) {
      handleEnter();
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-3 py-4 sm:p-4 relative overflow-hidden">
      <AudioControl />

      {/* 배경 장식 - 주사위들 (모바일에서 줄임) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-6 left-4 sm:top-10 sm:left-10 text-4xl sm:text-6xl opacity-20 animate-float">🎲</div>
        <div className="absolute top-12 right-6 sm:top-20 sm:right-20 text-3xl sm:text-5xl opacity-15 animate-float-delayed">🎲</div>
        <div className="absolute bottom-16 left-6 sm:bottom-20 sm:left-20 text-5xl sm:text-7xl opacity-10 animate-float">🎲</div>
        <div className="absolute bottom-8 right-4 sm:bottom-10 sm:right-10 text-3xl sm:text-4xl opacity-20 animate-float-delayed">🎲</div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="wood-frame p-5 sm:p-8 md:p-12 max-w-lg w-full text-center relative z-10">
        {/* 로고/타이틀 영역 */}
        <div className="mb-5 sm:mb-8">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-2 sm:mb-4">🎲</div>
          <h1 className="game-title text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2">Yacht Dice</h1>
          <p className="text-wood-light text-xs sm:text-sm md:text-base">
            멀티플레이어 주사위 게임
          </p>
        </div>

        {/* 게임 설명 */}
        <div className="felt-table p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">👥</div>
              <p className="text-wood-light text-[10px] sm:text-xs">1~4명</p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🤖</div>
              <p className="text-wood-light text-[10px] sm:text-xs">AI 대전</p>
            </div>
            <div>
              <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🌐</div>
              <p className="text-wood-light text-[10px] sm:text-xs">온라인</p>
            </div>
          </div>
        </div>

        {/* 닉네임 입력 */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-wood-light text-xs sm:text-sm mb-1.5 sm:mb-2">닉네임을 입력하세요</label>
          <input
            type="text"
            placeholder="닉네임 (최대 10자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none text-center text-base sm:text-lg"
            maxLength={10}
          />
        </div>

        {/* 입장 버튼 */}
        <button
          onClick={handleEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={!nickname.trim()}
          className={`
            btn-primary w-full text-lg sm:text-xl py-4 sm:py-5 font-bold
            transition-all duration-300 transform active:scale-95
            ${isHovered && nickname.trim() ? 'scale-105 shadow-2xl' : ''}
            ${!nickname.trim() ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <span>로비 입장</span>
            <span className={`transition-transform duration-300 ${isHovered && nickname.trim() ? 'translate-x-1' : ''}`}>
              →
            </span>
          </span>
        </button>

        {/* 안내 문구 */}
        <div className="mt-4 sm:mt-6 text-wood-light/70 text-[10px] sm:text-xs">
          <p>방을 만들거나 다른 플레이어의 방에 참여하세요!</p>
        </div>
      </div>

      {/* 하단 크레딧 */}
      <div className="mt-4 sm:mt-8 text-wood-light/50 text-[10px] sm:text-xs">
        <p>Made with Vibe Coding</p>
      </div>
    </div>
  );
}
