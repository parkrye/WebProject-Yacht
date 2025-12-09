import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/game.store';
import { useAudioStore } from '../stores/audio.store';
import { calculateScore } from '../services/game-engine';
import { firebaseService } from '../services/firebase.service';
import type { ScoreCategory } from '../types/game.types';
import {
  DiceView,
  Scoreboard,
  GameStatus,
  TurnActions,
  AudioControl,
  TurnNotification,
  TurnTimer,
  ChatBubble,
  ChatInput,
} from '../components';
import type { ChatMessage } from '../components';

const MAX_ROLLS = 3;
const MAX_PLAYERS = 4;
const TURN_TIMEOUT_SECONDS = 30;

interface GamePageProps {
  nickname: string;
  gameId: string | null; // null이면 새 방 생성, 있으면 해당 방 참여
  onBackToLobby: () => void;
}

export function GamePage({ nickname, gameId, onBackToLobby }: GamePageProps) {
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
  } = useGameStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isOtherPlayerRolling, setIsOtherPlayerRolling] = useState(false);
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_TIMEOUT_SECONDS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // 오디오 관련
  const { playSfx, playBGM, stopBGM } = useAudioStore();
  const prevPhaseRef = useRef<string | null>(null);
  const prevPlayerIndexRef = useRef<number | null>(null);
  const prevDiceValuesRef = useRef<number[] | null>(null);
  const prevIsMyTurnRef = useRef<boolean>(false);
  const turnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const chatUnsubscribeRef = useRef<(() => void) | null>(null);

  // 방 생성 또는 참여
  useEffect(() => {
    const initGame = async () => {
      if (isInitialized) return;

      if (gameId) {
        // 기존 방 참여
        await joinGame(gameId, nickname);
      } else {
        // 새 방 생성
        await createGame(nickname);
      }
      setIsInitialized(true);
    };

    initGame();
  }, [gameId, nickname, createGame, joinGame, isInitialized]);

  // 채팅 메시지 구독
  useEffect(() => {
    if (!gameState?.id) return;

    // 이전 구독 해제
    if (chatUnsubscribeRef.current) {
      chatUnsubscribeRef.current();
    }

    // 새 구독 설정
    chatUnsubscribeRef.current = firebaseService.subscribeToChatMessages(
      gameState.id,
      (messages) => setChatMessages(messages)
    );

    return () => {
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();
      }
    };
  }, [gameState?.id]);

  // 게임 상태 변화에 따른 효과음 재생
  useEffect(() => {
    if (!gameState) {
      stopBGM();
      return;
    }

    const prevPhase = prevPhaseRef.current;
    const prevPlayerIndex = prevPlayerIndexRef.current;
    const prevDiceValues = prevDiceValuesRef.current;

    // 게임 시작 효과음 및 BGM
    if (prevPhase === 'waiting' && gameState.phase === 'rolling') {
      playSfx('game-start');
      playBGM('game');
    }

    // 게임 종료 효과음 및 BGM
    if (prevPhase !== 'finished' && gameState.phase === 'finished') {
      playSfx('game-end');
      playBGM('result');
    }

    // 턴 변경 감지 (점수 선택 후 턴이 바뀐 경우)
    const isTurnChange =
      prevPlayerIndex !== null &&
      prevPlayerIndex !== gameState.currentPlayerIndex &&
      gameState.phase === 'rolling';

    // 주사위 값 변경 감지 (새 턴의 첫 굴림)
    const isDiceChanged =
      prevDiceValues &&
      gameState.diceSet.values.some((v, i) => v !== prevDiceValues[i]);

    // 다른 플레이어가 주사위를 굴렸을 때 흔들림 애니메이션 + SFX
    if (isDiceChanged && !isMyTurn()) {
      setIsOtherPlayerRolling(true);
      playSfx('dice-roll');
      setTimeout(() => {
        setIsOtherPlayerRolling(false);
        // 야찌 체크
        const values = gameState.diceSet.values;
        if (values.every(v => v === values[0]) && gameState.diceSet.rollCount > 0) {
          setTimeout(() => playSfx('yacht'), 300);
        }
      }, 800);
    }

    if (isTurnChange && isDiceChanged) {
      // 턴 변경 + 주사위 굴림이 동시에 발생 (AI 턴 등)
      // 턴 변경 효과음만 재생 (dice-roll은 위에서 처리됨)
      playSfx('turn-change');
    } else if (isTurnChange) {
      // 턴 변경만 발생
      playSfx('turn-change');
    }

    // 현재 상태 저장
    prevPhaseRef.current = gameState.phase;
    prevPlayerIndexRef.current = gameState.currentPlayerIndex;
    prevDiceValuesRef.current = [...gameState.diceSet.values];
  }, [gameState, playSfx, playBGM, stopBGM]);

  // 내 차례가 되었을 때 알림 표시 (1인 플레이 시 제외)
  useEffect(() => {
    const currentIsMyTurn = isMyTurn();
    const wasMyTurn = prevIsMyTurnRef.current;

    // 내 차례가 아니었다가 내 차례가 되었을 때 (단, 플레이어가 2명 이상일 때만)
    if (!wasMyTurn && currentIsMyTurn && gameState?.phase === 'rolling' && gameState.players.length > 1) {
      setShowTurnNotification(true);
    }

    prevIsMyTurnRef.current = currentIsMyTurn;
  }, [gameState, isMyTurn]);

  // 활동 기록 함수 (타이머 리셋용)
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setTurnTimeLeft(TURN_TIMEOUT_SECONDS);
  }, []);

  // 현재 주사위로 가장 높은 점수를 얻을 수 있는 카테고리 찾기
  const findBestAvailableCategory = useCallback((): ScoreCategory | null => {
    if (!gameState) return null;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return null;

    const allCategories: ScoreCategory[] = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'threeOfAKind', 'fourOfAKind', 'fullHouse',
      'smallStraight', 'largeStraight', 'choice', 'yacht'
    ];

    const availableCategories = allCategories.filter(cat => {
      const score = currentPlayer.scoreCard[cat];
      return score === null || score === undefined;
    });

    if (availableCategories.length === 0) return null;

    // 각 카테고리별 점수 계산하여 최고 점수 카테고리 선택
    let bestCategory = availableCategories[0];
    let bestScore = calculateScore(bestCategory, gameState.diceSet.values);

    for (const cat of availableCategories) {
      const score = calculateScore(cat, gameState.diceSet.values);
      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    }

    return bestCategory;
  }, [gameState]);

  // 30초 타이머 및 자동 점수 할당
  useEffect(() => {
    const currentIsMyTurn = isMyTurn();

    // 타이머 정리 함수
    const clearTimer = () => {
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        turnTimerRef.current = null;
      }
    };

    // 내 차례가 아니면 타이머 정지
    if (!currentIsMyTurn || gameState?.phase !== 'rolling' || isRolling) {
      clearTimer();
      setTurnTimeLeft(TURN_TIMEOUT_SECONDS);
      return;
    }

    // 아직 한 번도 굴리지 않았으면 타이머 시작하지 않음
    if (gameState.diceSet.rollCount === 0) {
      clearTimer();
      setTurnTimeLeft(TURN_TIMEOUT_SECONDS);
      return;
    }

    // 타이머 시작
    lastActivityRef.current = Date.now();
    setTurnTimeLeft(TURN_TIMEOUT_SECONDS);

    turnTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, TURN_TIMEOUT_SECONDS - elapsed);
      setTurnTimeLeft(remaining);

      // 30초 경과시 자동 점수 할당
      if (remaining <= 0) {
        clearTimer();

        const bestCategory = findBestAvailableCategory();
        if (bestCategory) {
          console.log('[Auto] 30초 경과 - 자동 점수 할당:', bestCategory);
          playSfx('score-select');
          selectScore(bestCategory);
        }
      }
    }, 1000);

    return clearTimer;
  }, [gameState, isMyTurn, isRolling, findBestAvailableCategory, selectScore, playSfx]);

  // 주사위 애니메이션 지속 시간 (ms)
  const ROLL_ANIMATION_DURATION = 1000;

  // 효과음이 추가된 래퍼 함수들
  const handleRollDice = async () => {
    recordActivity();
    playSfx('button-click');
    setIsRolling(true);

    // 주사위 굴림 시작 시 SFX 재생
    playSfx('dice-roll');

    await new Promise(resolve => setTimeout(resolve, ROLL_ANIMATION_DURATION));
    await rollDice();

    setIsRolling(false);
    recordActivity();

    // 야찌 체크 (롤 완료 후)
    const state = useGameStore.getState().gameState;
    if (state) {
      const values = state.diceSet.values;
      if (values.every(v => v === values[0]) && state.diceSet.rollCount > 0) {
        setTimeout(() => playSfx('yacht'), 300);
      }
    }
  };

  const handleToggleKeep = (index: number) => {
    recordActivity();
    playSfx('dice-keep');
    toggleKeep(index);
  };

  const handleSelectScore = async (category: Parameters<typeof selectScore>[0]) => {
    recordActivity();
    playSfx('score-select');
    // 점수 선택 효과음 후 딜레이를 줘서 턴 변경 효과음과 겹치지 않게 함
    await new Promise(resolve => setTimeout(resolve, 300));
    selectScore(category);
  };

  const handleStartGame = () => {
    playSfx('button-click');
    startGame();
  };

  const handleAddBot = () => {
    playSfx('button-click');
    addBot();
  };

  const handleLeaveGame = () => {
    playSfx('button-click');
    leaveGame();
    onBackToLobby();
  };

  const handleRestartGame = () => {
    playSfx('button-click');
    restartGame();
  };

  // 채팅 메시지 전송
  const handleSendChat = async (message: string) => {
    if (!gameState) return;

    const { currentPlayerId } = useGameStore.getState();
    const myPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!myPlayer) return;

    playSfx('button-click');
    await firebaseService.sendChatMessage(gameState.id, {
      playerId: myPlayer.id,
      playerName: myPlayer.name,
      message,
      timestamp: Date.now(),
    });
  };

  const currentPlayer = gameState
    ? gameState.players[gameState.currentPlayerIndex]
    : null;

  const canRoll =
    gameState?.phase === 'rolling' &&
    gameState.diceSet.rollCount < MAX_ROLLS;

  const canSelectScore = gameState?.phase === 'rolling' && isMyTurn() && gameState.diceSet.rollCount > 0;

  // 초기화 중 로딩 화면
  if (!isInitialized || !gameState) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4">
        <AudioControl />
        <div className="wood-frame p-5 sm:p-8 max-w-md w-full text-center">
          <h1 className="game-title text-center mb-5 sm:mb-8 text-2xl sm:text-3xl">Yacht Dice</h1>
          {error ? (
            <>
              <p className="text-red-400 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
              <button onClick={onBackToLobby} className="btn-secondary active:scale-95">
                로비로 돌아가기
              </button>
            </>
          ) : (
            <p className="text-wood-light text-sm sm:text-base">게임 준비 중...</p>
          )}
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
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-3 sm:p-4">
        <AudioControl />
        <div className="wood-frame p-4 sm:p-8 max-w-lg w-full">
          <h2 className="text-gold text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
            게임 종료
          </h2>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 sm:px-4 py-2 rounded mb-3 sm:mb-4 text-center text-sm">
              {error}
            </div>
          )}

          <div className="felt-table p-4 sm:p-6 mb-4 sm:mb-6">
            {/* 1등 강조 */}
            <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-wood-dark/30">
              <div className="text-5xl sm:text-6xl mb-2">🏆</div>
              <p className="text-gold-light text-xl sm:text-2xl font-bold">
                {winner.player.name}
              </p>
              <p className="text-gold text-3xl sm:text-4xl font-bold mt-1">
                {winner.total}점
              </p>
              {winner.bonus > 0 && (
                <p className="text-green-400 text-xs sm:text-sm mt-1">(+{winner.bonus} 보너스 포함)</p>
              )}
            </div>

            {/* 나머지 순위 */}
            {scores.length > 1 && (
              <div className="space-y-2 sm:space-y-3">
                {scores.slice(1).map((s, i) => (
                  <div
                    key={s.player.id}
                    className="flex items-center justify-between text-wood-light py-2 px-2 sm:px-3 bg-wood-dark/20 rounded"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-wood-dark/50 rounded-full text-gold font-bold text-sm sm:text-base">
                        {i + 2}
                      </span>
                      <span className="text-sm sm:text-lg truncate max-w-[80px] sm:max-w-none">{s.player.name}</span>
                      {s.player.id.startsWith('bot_') && (
                        <span className="text-[10px] sm:text-xs bg-purple-600 px-1.5 sm:px-2 py-0.5 rounded text-white">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-xl font-semibold text-gold">{s.total}점</span>
                      {s.bonus > 0 && (
                        <span className="text-[10px] sm:text-xs text-green-400 ml-1">(+{s.bonus})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="space-y-2 sm:space-y-3">
            {isHost() ? (
              <>
                <button
                  className="btn-primary w-full text-base sm:text-lg py-2.5 sm:py-3 active:scale-95"
                  onClick={handleRestartGame}
                  disabled={isLoading}
                >
                  {isLoading ? '재시작 중...' : '다시 하기'}
                </button>
                <button
                  className="btn-secondary w-full text-base sm:text-lg py-2.5 sm:py-3 active:scale-95"
                  onClick={handleLeaveGame}
                  disabled={isLoading}
                >
                  로비로 나가기
                </button>
              </>
            ) : (
              <button
                className="btn-secondary w-full text-base sm:text-lg py-2.5 sm:py-3 active:scale-95"
                onClick={handleLeaveGame}
                disabled={isLoading}
              >
                로비로 나가기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game View
  const myPlayerId = useGameStore.getState().currentPlayerId || '';

  return (
    <div className="min-h-screen min-h-[100dvh] px-2 py-2 sm:p-4">
      <AudioControl />
      <TurnNotification
        show={showTurnNotification}
        onHide={() => setShowTurnNotification(false)}
      />
      {/* 채팅 UI - 게임 진행 중에만 표시 */}
      {gameState.phase !== 'waiting' && (
        <>
          <ChatBubble messages={chatMessages} currentPlayerId={myPlayerId} />
          <ChatInput onSend={handleSendChat} disabled={isLoading} />
        </>
      )}
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Header */}
        <div className="wood-frame p-2.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleLeaveGame}
              className="text-wood-light hover:text-gold transition-colors text-xs sm:text-sm active:scale-95"
            >
              ← 나가기
            </button>
            <h1 className="game-title text-lg sm:text-2xl md:text-3xl">Yacht Dice</h1>
            <div className="flex items-center gap-1 sm:gap-2 bg-wood-dark/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded">
              <span className="text-wood-light text-[10px] sm:text-sm hidden sm:inline">방 코드:</span>
              <code className="text-gold font-mono text-xs sm:text-sm">{gameState.id}</code>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 sm:px-4 py-2 rounded text-center text-xs sm:text-sm">
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
          <div className="wood-frame p-4 sm:p-6">
            <h3 className="text-gold text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">
              대기실 ({gameState.players.length}/{MAX_PLAYERS})
            </h3>

            <div className="felt-table p-3 sm:p-4">
              <ul className="space-y-2">
                {gameState.players.map((player, index) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base"
                  >
                    <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-gold text-wood-darker rounded-full font-bold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                    <span className="truncate">{player.name}</span>
                    {player.id === gameState.hostId && (
                      <span className="text-[10px] sm:text-xs bg-gold/80 px-1.5 sm:px-2 py-0.5 rounded text-wood-darker font-semibold">
                        방장
                      </span>
                    )}
                    {player.id.startsWith('bot_') && (
                      <span className="text-[10px] sm:text-xs bg-purple-600 px-1.5 sm:px-2 py-0.5 rounded text-white">
                        AI
                      </span>
                    )}
                  </li>
                ))}

                {/* AI 추가 버튼 - 방장만 */}
                {isHost() && gameState.players.length < MAX_PLAYERS && (
                  <li>
                    <button
                      onClick={handleAddBot}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-wood-light/30 rounded-lg text-wood-light/70 hover:border-gold hover:text-gold transition-colors text-sm sm:text-base active:scale-95"
                    >
                      <span className="text-lg sm:text-xl">+</span>
                      <span>AI 추가</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <p className="text-wood-light/70 text-xs sm:text-sm text-center mt-3 sm:mt-4">
              {isHost()
                ? '방 코드를 공유하거나 AI를 추가하세요'
                : '방장이 게임을 시작하길 기다리는 중...'}
            </p>
          </div>
        )}

        {/* Dice Area */}
        {gameState.phase !== 'waiting' && (
          <DiceView
            values={gameState.diceSet.values}
            kept={gameState.diceSet.kept}
            onToggleKeep={handleToggleKeep}
            disabled={!isMyTurn() || isLoading || isRolling || gameState.diceSet.rollCount === 0}
            isRolling={isRolling || isOtherPlayerRolling}
          />
        )}

        {/* Turn Timer - 내 차례이고 굴린 후에만 표시 */}
        {gameState.phase === 'rolling' && isMyTurn() && gameState.diceSet.rollCount > 0 && (
          <div className="wood-frame p-2 sm:p-3">
            <TurnTimer
              timeLeft={turnTimeLeft}
              maxTime={TURN_TIMEOUT_SECONDS}
              show={true}
            />
          </div>
        )}

        {/* Turn Actions */}
        <TurnActions
          phase={gameState.phase}
          canRoll={canRoll && !isRolling}
          isMyTurn={isMyTurn()}
          onRoll={handleRollDice}
          onStartGame={handleStartGame}
          isLoading={isLoading || isRolling}
          playerCount={gameState.players.length}
          isHost={isHost()}
          rollCount={gameState.diceSet.rollCount}
        />

        {/* Scoreboard */}
        {gameState.players.length > 0 && (
          <Scoreboard
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            diceValues={gameState.diceSet.values}
            onSelectCategory={handleSelectScore}
            canSelectScore={canSelectScore}
          />
        )}
      </div>
    </div>
  );
}
