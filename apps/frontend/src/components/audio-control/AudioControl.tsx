import { useState } from 'react';
import { useAudioStore } from '../../stores/audio.store';

export function AudioControl() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    bgmVolume,
    sfxVolume,
    bgmMuted,
    sfxMuted,
    setBgmVolume,
    setSfxVolume,
    toggleBgmMute,
    toggleSfxMute,
    playSfx,
  } = useAudioStore();

  const handleToggle = () => {
    playSfx('button-click');
    setIsOpen(!isOpen);
  };

  const handleBgmVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgmVolume(parseFloat(e.target.value));
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSfxVolume(parseFloat(e.target.value));
  };

  const handleTestSfx = () => {
    playSfx('dice-roll');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* 토글 버튼 */}
      <button
        onClick={handleToggle}
        className="w-12 h-12 bg-wood-dark hover:bg-wood rounded-full shadow-lg flex items-center justify-center transition-colors border-2 border-gold/50"
        title="오디오 설정"
      >
        {bgmMuted && sfxMuted ? (
          <SpeakerOffIcon />
        ) : (
          <SpeakerOnIcon />
        )}
      </button>

      {/* 설정 패널 */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-72 bg-wood-darker border-2 border-gold/30 rounded-lg shadow-xl p-4">
          <h3 className="text-gold font-bold text-lg mb-4 text-center">
            오디오 설정
          </h3>

          {/* BGM 설정 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-wood-light text-sm">배경음악</span>
              <button
                onClick={toggleBgmMute}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  bgmMuted
                    ? 'bg-red-900/50 text-red-400'
                    : 'bg-green-900/50 text-green-400'
                }`}
                title={bgmMuted ? '음소거 해제' : '음소거'}
              >
                {bgmMuted ? <MuteIcon /> : <UnmuteIcon />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVolume}
              onChange={handleBgmVolumeChange}
              disabled={bgmMuted}
              className="w-full h-2 bg-wood-dark rounded-lg appearance-none cursor-pointer accent-gold disabled:opacity-50"
            />
            <div className="text-right text-xs text-wood-light/70 mt-1">
              {Math.round(bgmVolume * 100)}%
            </div>
          </div>

          {/* 효과음 설정 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-wood-light text-sm">효과음</span>
              <button
                onClick={toggleSfxMute}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  sfxMuted
                    ? 'bg-red-900/50 text-red-400'
                    : 'bg-green-900/50 text-green-400'
                }`}
                title={sfxMuted ? '음소거 해제' : '음소거'}
              >
                {sfxMuted ? <MuteIcon /> : <UnmuteIcon />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              disabled={sfxMuted}
              className="w-full h-2 bg-wood-dark rounded-lg appearance-none cursor-pointer accent-gold disabled:opacity-50"
            />
            <div className="flex justify-between items-center mt-1">
              <button
                onClick={handleTestSfx}
                className="text-xs text-gold hover:text-gold-light underline"
              >
                테스트
              </button>
              <span className="text-xs text-wood-light/70">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-wood-dark hover:bg-wood rounded text-wood-light text-sm transition-colors"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}

// 아이콘 컴포넌트들
function SpeakerOnIcon() {
  return (
    <svg
      className="w-6 h-6 text-gold"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      className="w-6 h-6 text-red-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
        clipRule="evenodd"
      />
    </svg>
  );
}
