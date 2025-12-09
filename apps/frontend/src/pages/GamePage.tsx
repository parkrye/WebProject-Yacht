import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/game.store';
import {
  DiceView,
  Scoreboard,
  GameStatus,
  TurnActions,
} from '../components';

const MAX_ROLLS = 3;
const MAX_PLAYERS = 4;

export function GamePage() {
  const {
    gameState,
    isLoading,
    error,
    createGame,
    joinGame,
    addBot,
    startGame,
    rollDice,
    toggleKeep,
    selectScore,
    leaveGame,
    restartGame,
    isHost,
    isMyTurn,
    restoreSession,
  } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [isRestoring, setIsRestoring] = useState(true);

  // 앱 시작 시 세션 복구 시도
  useEffect(() => {
    const tryRestore = async () => {
      await restoreSession();
      setIsRestoring(false);
    };
    tryRestore();
  }, [restoreSession]);
  const [gameCodeInput, setGameCodeInput] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      return;
    }
    await createGame(playerName.trim());
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameCodeInput.trim()) {
      return;
    }
    await joinGame(gameCodeInput.trim().toUpperCase(), playerName.trim());
  };

  const currentPlayer = gameState
    ? gameState.players[gameState.currentPlayerIndex]
    : null;

  const canRoll =
    gameState?.phase === 'rolling' &&
    gameState.diceSet.rollCount < MAX_ROLLS;

  const canSelectScore = gameState?.phase === 'rolling' && isMyTurn();

  // 세션 복구 중 로딩 화면
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="wood-frame p-8 max-w-md w-full text-center">
          <h1 className="game-title text-center mb-8">Yacht Dice</h1>
          <p className="text-wood-light">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Lobby View
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="wood-frame p-8 max-w-md w-full">
          <h1 className="game-title text-center mb-8">Yacht Dice</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 닉네임 입력 */}
            <div>
              <label className="block text-wood-light text-sm mb-2">닉네임</label>
              <input
                type="text"
                placeholder="닉네임을 입력하세요"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none text-center text-lg"
                maxLength={10}
              />
            </div>

            {/* 방 만들기 */}
            <button
              className="btn-primary w-full text-lg py-4"
              onClick={handleCreateGame}
              disabled={isLoading || !playerName.trim()}
            >
              {isLoading ? '생성 중...' : '방 만들기'}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-wood-dark" />
              <span className="text-wood-light text-sm">또는</span>
              <div className="flex-1 h-px bg-wood-dark" />
            </div>

            {/* 방 코드 입력 */}
            <div>
              <label className="block text-wood-light text-sm mb-2">방 코드</label>
              <input
                type="text"
                placeholder="5자리 코드 입력"
                value={gameCodeInput}
                onChange={(e) => setGameCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none text-center text-lg font-mono tracking-widest"
                maxLength={5}
              />
            </div>

            {/* 기존 방 입장 */}
            <button
              className="btn-secondary w-full text-lg py-4"
              onClick={handleJoinGame}
              disabled={isLoading || !gameCodeInput.trim() || !playerName.trim()}
            >
              {isLoading ? '입장 중...' : '기존 방 입장'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over View - 결과만 표시
  if (gameState.phase === 'finished') {
    const calculateUpperTotal = (scoreCard: typeof gameState.players[0]['scoreCard']) => {
      return (scoreCard.ones ?? 0) + (scoreCard.twos ?? 0) + (scoreCard.threes ?? 0) +
             (scoreCard.fours ?? 0) + (scoreCard.fives ?? 0) + (scoreCard.sixes ?? 0);
    };
    const calculateBonus = (scoreCard: typeof gameState.players[0]['scoreCard']) => {
      return calculateUpperTotal(scoreCard) >= 63 ? 35 : 0;
    };
    const scores = gameState.players.map((p) => {
      const baseTotal = Object.values(p.scoreCard).reduce(
        (sum: number, s) => sum + (s ?? 0),
        0
      );
      const bonus = calculateBonus(p.scoreCard);
      return {
        player: p,
        bonus,
        total: baseTotal + bonus,
      };
    });
    scores.sort((a, b) => b.total - a.total);
    const winner = scores[0];

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="wood-frame p-8 max-w-lg w-full">
          <h2 className="text-gold text-3xl font-bold text-center mb-6">
            게임 종료
          </h2>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <div className="felt-table p-6 mb-6">
            {/* 1등 강조 */}
            <div className="text-center mb-6 pb-6 border-b border-wood-dark/30">
              <div className="text-6xl mb-2">🏆</div>
              <p className="text-gold-light text-2xl font-bold">
                {winner.player.name}
              </p>
              <p className="text-gold text-4xl font-bold mt-1">
                {winner.total}점
              </p>
              {winner.bonus > 0 && (
                <p className="text-green-400 text-sm mt-1">(+{winner.bonus} 보너스 포함)</p>
              )}
            </div>

            {/* 나머지 순위 */}
            {scores.length > 1 && (
              <div className="space-y-3">
                {scores.slice(1).map((s, i) => (
                  <div
                    key={s.player.id}
                    className="flex items-center justify-between text-wood-light py-2 px-3 bg-wood-dark/20 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-wood-dark/50 rounded-full text-gold font-bold">
                        {i + 2}
                      </span>
                      <span className="text-lg">{s.player.name}</span>
                      {s.player.id.startsWith('bot_') && (
                        <span className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-semibold text-gold">{s.total}점</span>
                      {s.bonus > 0 && (
                        <span className="text-xs text-green-400 ml-1">(+{s.bonus})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="space-y-3">
            {isHost() ? (
              <>
                <button
                  className="btn-primary w-full text-lg py-3"
                  onClick={restartGame}
                  disabled={isLoading}
                >
                  {isLoading ? '재시작 중...' : '방 재시작'}
                </button>
                <button
                  className="btn-secondary w-full text-lg py-3"
                  onClick={leaveGame}
                  disabled={isLoading}
                >
                  방 나가기
                </button>
              </>
            ) : (
              <button
                className="btn-secondary w-full text-lg py-3"
                onClick={leaveGame}
                disabled={isLoading}
              >
                방 나가기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game View
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="wood-frame p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <h1 className="game-title text-2xl sm:text-3xl">Yacht Dice</h1>
            <div className="flex items-center gap-2 bg-wood-dark/50 px-3 py-1.5 rounded">
              <span className="text-wood-light text-sm">방 코드:</span>
              <code className="text-gold font-mono text-sm">{gameState.id}</code>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}

        {/* Game Status */}
        <GameStatus
          phase={gameState.phase}
          round={gameState.round}
          currentPlayer={currentPlayer}
          rollCount={gameState.diceSet.rollCount}
          maxRolls={MAX_ROLLS}
        />

        {/* Waiting Room */}
        {gameState.phase === 'waiting' && (
          <div className="wood-frame p-6">
            <h3 className="text-gold text-lg font-bold mb-4 text-center">
              대기실 ({gameState.players.length}/{MAX_PLAYERS})
            </h3>

            <div className="felt-table p-4">
              <ul className="space-y-2">
                {gameState.players.map((player, index) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 text-white"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-gold text-wood-darker rounded-full font-bold text-sm">
                      {index + 1}
                    </span>
                    <span>{player.name}</span>
                    {player.id === gameState.hostId && (
                      <span className="text-xs bg-gold/80 px-2 py-0.5 rounded text-wood-darker font-semibold">
                        방장
                      </span>
                    )}
                    {player.id.startsWith('bot_') && (
                      <span className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white">
                        AI
                      </span>
                    )}
                  </li>
                ))}

                {/* AI 추가 버튼 - 방장만 */}
                {isHost() && gameState.players.length < MAX_PLAYERS && (
                  <li>
                    <button
                      onClick={addBot}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-wood-light/30 rounded-lg text-wood-light/70 hover:border-gold hover:text-gold transition-colors"
                    >
                      <span className="text-xl">+</span>
                      <span>AI 추가</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <p className="text-wood-light/70 text-sm text-center mt-4">
              {isHost()
                ? '다른 플레이어에게 방 코드를 공유하거나 AI를 추가하세요'
                : '방장이 게임을 시작하길 기다리는 중...'}
            </p>
          </div>
        )}

        {/* Dice Area */}
        {gameState.phase !== 'waiting' && (
          <DiceView
            values={gameState.diceSet.values}
            kept={gameState.diceSet.kept}
            onToggleKeep={toggleKeep}
            disabled={!isMyTurn() || isLoading}
          />
        )}

        {/* Turn Actions */}
        <TurnActions
          phase={gameState.phase}
          canRoll={canRoll}
          isMyTurn={isMyTurn()}
          onRoll={rollDice}
          onStartGame={startGame}
          isLoading={isLoading}
          playerCount={gameState.players.length}
          isHost={isHost()}
        />

        {/* Scoreboard */}
        {gameState.players.length > 0 && (
          <Scoreboard
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            diceValues={gameState.diceSet.values}
            onSelectCategory={selectScore}
            canSelectScore={canSelectScore}
          />
        )}
      </div>
    </div>
  );
}
