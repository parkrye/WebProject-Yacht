import { useState, useEffect } from 'react';
import { AudioControl } from '../components';
import { useAudioStore } from '../stores/audio.store';
import { firebaseService } from '../services/firebase.service';
import type { GameState } from '../types/game.types';

interface LobbyPageProps {
  nickname: string;
  onCreateRoom: () => void;
  onJoinRoom: (gameId: string) => void;
  onBackToHome: () => void;
}

export function LobbyPage({ nickname, onCreateRoom, onJoinRoom, onBackToHome }: LobbyPageProps) {
  const [rooms, setRooms] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const { playSfx, playBGM } = useAudioStore();

  // 메인 BGM 유지 (홈에서 넘어올 때 이미 재생 중이면 유지됨)
  useEffect(() => {
    playBGM('main');
  }, [playBGM]);

  // 방 목록 실시간 구독
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeToRooms((roomList) => {
      setRooms(roomList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = () => {
    playSfx('button-click');
    onCreateRoom();
  };

  const handleJoinRoom = (gameId: string) => {
    playSfx('button-click');
    onJoinRoom(gameId);
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) return;
    playSfx('button-click');
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  const handleBack = () => {
    playSfx('button-click');
    onBackToHome();
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    return `${Math.floor(minutes / 60)}시간 전`;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] px-2 py-3 sm:p-4">
      <AudioControl />

      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="wood-frame p-2.5 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleBack}
              className="text-wood-light hover:text-gold transition-colors text-sm sm:text-base active:scale-95"
            >
              ← 홈
            </button>
            <h1 className="game-title text-xl sm:text-2xl">로비</h1>
            <div className="text-gold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
              {nickname}
            </div>
          </div>
        </div>

        {/* 방 만들기 & 코드로 입장 */}
        <div className="wood-frame p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* 방 만들기 */}
            <button
              onClick={handleCreateRoom}
              className="btn-primary w-full py-3 sm:py-4 text-base sm:text-lg font-bold active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl">+</span>
                <span>새 방 만들기</span>
              </span>
            </button>

            {/* 코드로 입장 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="방 코드"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none text-center font-mono tracking-widest text-sm sm:text-base"
                maxLength={5}
              />
              <button
                onClick={handleJoinByCode}
                disabled={!joinCode.trim()}
                className="btn-secondary px-4 sm:px-6 disabled:opacity-50 text-sm sm:text-base active:scale-95"
              >
                입장
              </button>
            </div>
          </div>
        </div>

        {/* 방 목록 */}
        <div className="wood-frame p-3 sm:p-4">
          <h2 className="text-gold text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span>대기 중인 방</span>
            <span className="text-xs sm:text-sm text-wood-light font-normal">
              ({rooms.length}개)
            </span>
            {isLoading && (
              <span className="text-xs sm:text-sm text-wood-light animate-pulse">로딩...</span>
            )}
          </h2>

          {rooms.length === 0 ? (
            <div className="felt-table p-5 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 opacity-50">🎲</div>
              <p className="text-wood-light/70 text-sm sm:text-base">
                {isLoading ? '방 목록을 불러오는 중...' : '대기 중인 방이 없습니다'}
              </p>
              <p className="text-wood-light/50 text-xs sm:text-sm mt-2">
                새 방을 만들어 게임을 시작하세요!
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="felt-table p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 hover:bg-felt-light/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <span className="text-gold font-mono font-bold text-sm sm:text-base">{room.id}</span>
                      <span className="text-wood-light/50 text-[10px] sm:text-xs">
                        {formatTime(room.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-wood-light">
                        👥 {room.players.length}/4
                      </span>
                      <span className="text-wood-light/70 truncate">
                        {room.players.find(p => p.id === room.hostId)?.name || '?'}
                      </span>
                    </div>
                    {/* 플레이어 목록 */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                      {room.players.map((player) => (
                        <span
                          key={player.id}
                          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${
                            player.id === room.hostId
                              ? 'bg-gold/20 text-gold'
                              : player.id.startsWith('bot_')
                              ? 'bg-purple-600/20 text-purple-400'
                              : 'bg-wood-dark/50 text-wood-light'
                          }`}
                        >
                          {player.name}
                          {player.id.startsWith('bot_') && ' 🤖'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="btn-primary px-3 sm:px-6 py-2 text-sm sm:text-base shrink-0 active:scale-95"
                  >
                    참여
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="text-center mt-3 sm:mt-4 text-wood-light/50 text-[10px] sm:text-xs">
          <p>방 목록은 실시간으로 업데이트됩니다</p>
        </div>
      </div>
    </div>
  );
}
