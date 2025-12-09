import { useState } from 'react';
import { useGameStore } from '../stores/game.store';
import {
  DiceView,
  Scoreboard,
  GameStatus,
  TurnActions,
} from '../components';
import type { GamePhase } from '../types/game.types';

const MAX_ROLLS = 3;
const MAX_PLAYERS = 4;

export function GamePage() {
  const {
    gameState,
    isLoading,
    error,
    createGame,
    joinGame,
    startGame,
    rollDice,
    toggleKeep,
    selectScore,
  } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');

  const handleCreateGame = async () => {
    await createGame();
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      return;
    }

    const gameId = gameIdInput || gameState?.id;
    if (!gameId) {
      return;
    }

    await joinGame(gameId, playerName.trim());
    setPlayerName('');
  };

  const currentPlayer = gameState
    ? gameState.players[gameState.currentPlayerIndex]
    : null;

  const canRoll =
    gameState?.phase === 'rolling' &&
    gameState.diceSet.rollCount < MAX_ROLLS;

  const canSelectScore = gameState?.phase === 'rolling';

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
            <button
              className="btn-primary w-full text-lg py-4"
              onClick={handleCreateGame}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create New Game'}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-wood-dark" />
              <span className="text-wood-light text-sm">OR</span>
              <div className="flex-1 h-px bg-wood-dark" />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter Game ID"
                value={gameIdInput}
                onChange={(e) => setGameIdInput(e.target.value)}
                className="w-full px-4 py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none"
              />
              <button
                className="btn-secondary w-full"
                onClick={handleJoinGame}
                disabled={isLoading || !gameIdInput || !playerName}
              >
                Join Game
              </button>
            </div>
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
              <span className="text-wood-light text-sm">Game ID:</span>
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
              Players ({gameState.players.length}/{MAX_PLAYERS})
            </h3>

            <div className="felt-table p-4 mb-4">
              {gameState.players.length > 0 ? (
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-wood-light/50 text-center">
                  No players yet. Add a player to start!
                </p>
              )}
            </div>

            {gameState.players.length < MAX_PLAYERS && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player Name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinGame()}
                  className="flex-1 px-4 py-2 bg-wood-dark/50 border-2 border-wood-dark rounded-lg text-white placeholder-wood-light/50 focus:border-gold focus:outline-none"
                />
                <button
                  className="btn-secondary"
                  onClick={handleJoinGame}
                  disabled={isLoading || !playerName}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dice Area */}
        {gameState.phase !== 'waiting' && (
          <DiceView
            values={gameState.diceSet.values}
            kept={gameState.diceSet.kept}
            onToggleKeep={toggleKeep}
            disabled={!canRoll || isLoading}
          />
        )}

        {/* Turn Actions */}
        <TurnActions
          phase={gameState.phase}
          canRoll={canRoll}
          onRoll={rollDice}
          onStartGame={startGame}
          isLoading={isLoading}
          playerCount={gameState.players.length}
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

        {/* Game Over */}
        {gameState.phase === 'finished' && (
          <div className="wood-frame p-6">
            <h2 className="text-gold text-2xl font-bold text-center mb-4">
              Final Results
            </h2>
            <div className="felt-table p-6">
              {(() => {
                const scores = gameState.players.map((p) => ({
                  player: p,
                  total: Object.values(p.scoreCard).reduce(
                    (sum: number, s) => sum + (s ?? 0),
                    0
                  ),
                }));
                scores.sort((a, b) => b.total - a.total);
                const winner = scores[0];

                return (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-gold text-4xl">&#127942;</span>
                      <p className="text-gold-light text-xl font-bold mt-2">
                        {winner.player.name}
                      </p>
                      <p className="text-gold text-3xl font-bold">
                        {winner.total} pts
                      </p>
                    </div>
                    {scores.length > 1 && (
                      <div className="border-t border-wood-dark/30 pt-4 space-y-2">
                        {scores.slice(1).map((s, i) => (
                          <div
                            key={s.player.id}
                            className="flex justify-between text-wood-light"
                          >
                            <span>
                              {i + 2}. {s.player.name}
                            </span>
                            <span>{s.total} pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
