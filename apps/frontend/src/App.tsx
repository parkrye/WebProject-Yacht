import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

type Page = 'home' | 'lobby' | 'game';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [nickname, setNickname] = useState('');
  const [targetGameId, setTargetGameId] = useState<string | null>(null);

  // 홈 → 로비
  const handleEnterLobby = (name: string) => {
    setNickname(name);
    setCurrentPage('lobby');
  };

  // 로비 → 홈
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  // 로비 → 게임 (새 방 만들기)
  const handleCreateRoom = () => {
    setTargetGameId(null);
    setCurrentPage('game');
  };

  // 로비 → 게임 (기존 방 참여)
  const handleJoinRoom = (gameId: string) => {
    setTargetGameId(gameId);
    setCurrentPage('game');
  };

  // 게임 → 로비
  const handleBackToLobby = () => {
    setTargetGameId(null);
    setCurrentPage('lobby');
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onEnterLobby={handleEnterLobby} />
      )}
      {currentPage === 'lobby' && (
        <LobbyPage
          nickname={nickname}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBackToHome={handleBackToHome}
        />
      )}
      {currentPage === 'game' && (
        <GamePage
          nickname={nickname}
          gameId={targetGameId}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
}

export default App;
