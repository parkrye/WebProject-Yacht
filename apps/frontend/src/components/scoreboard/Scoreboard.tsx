import { useState, useEffect } from 'react';
import type { Player, ScoreCategory, ScoreCard } from '../../types/game.types';
import { SCORE_CATEGORIES } from '../../types/game.types';
import { calculateScore } from '../../services/game-engine';

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
  diceValues: number[];
  onSelectCategory: (category: ScoreCategory) => void;
  canSelectScore: boolean;
}

const UPPER_CATEGORIES: ScoreCategory[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
];

const LOWER_CATEGORIES: ScoreCategory[] = [
  'threeOfAKind',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'choice',
  'yacht',
];

function getCategoryLabel(category: ScoreCategory): string {
  const found = SCORE_CATEGORIES.find((c) => c.key === category);
  return found?.label || category;
}

function ScoreRow({
  category,
  players,
  currentPlayerIndex,
  possibleScore,
  onSelect,
  canSelect,
  highlightedCell,
}: {
  category: ScoreCategory;
  players: Player[];
  currentPlayerIndex: number;
  possibleScore: number;
  onSelect: () => void;
  canSelect: boolean;
  highlightedCell: { category: ScoreCategory; playerIndex: number } | null;
}) {
  const currentPlayer = players[currentPlayerIndex];
  const scoreValue = currentPlayer?.scoreCard[category];
  const isAvailable = scoreValue === null || scoreValue === undefined;
  const isClickable = canSelect && isAvailable;

  return (
    <tr
      className={`
        border-b border-wood-dark/30 transition-colors
        ${isClickable ? 'hover:bg-gold/10 active:bg-gold/20 cursor-pointer' : ''}
      `}
      onClick={isClickable ? onSelect : undefined}
    >
      <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-left font-medium text-xs sm:text-sm">
        {getCategoryLabel(category)}
      </td>
      {players.map((player, index) => {
        const score = player.scoreCard[category];
        const isCurrentPlayer = index === currentPlayerIndex;
        const cellIsAvailable = score === null || score === undefined;
        const showPossible = isCurrentPlayer && cellIsAvailable && canSelect;
        const isHighlighted = highlightedCell?.category === category && highlightedCell?.playerIndex === index;

        return (
          <td
            key={player.id}
            className={`
              py-1.5 sm:py-2 px-1 sm:px-3 text-center text-xs sm:text-sm transition-all duration-300
              ${isCurrentPlayer ? 'bg-gold/5' : ''}
              ${isClickable && isCurrentPlayer ? 'text-gold font-bold' : ''}
              ${isHighlighted ? 'animate-score-flash bg-gold/30' : ''}
            `}
          >
            {score !== null && score !== undefined ? (
              <span className={`${isHighlighted ? 'text-gold font-bold text-base sm:text-lg' : 'text-white'}`}>
                {score}
              </span>
            ) : showPossible ? (
              <span className="text-gold/70 animate-pulse">{possibleScore}</span>
            ) : (
              <span className="text-wood-light/50">-</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function calculateTotal(scoreCard: ScoreCard): number {
  return Object.values(scoreCard).reduce(
    (sum: number, score) => sum + (score ?? 0),
    0
  );
}

function calculateUpperBonus(scoreCard: ScoreCard): { upper: number; bonus: number } {
  const upper =
    (scoreCard.ones ?? 0) +
    (scoreCard.twos ?? 0) +
    (scoreCard.threes ?? 0) +
    (scoreCard.fours ?? 0) +
    (scoreCard.fives ?? 0) +
    (scoreCard.sixes ?? 0);
  const bonus = upper >= 63 ? 35 : 0;
  return { upper, bonus };
}

export function Scoreboard({
  players,
  currentPlayerIndex,
  diceValues,
  onSelectCategory,
  canSelectScore,
}: ScoreboardProps) {
  const [highlightedCell, setHighlightedCell] = useState<{ category: ScoreCategory; playerIndex: number } | null>(null);
  const [prevScores, setPrevScores] = useState<Map<string, number | null>>(new Map());

  // 점수 변경 감지
  useEffect(() => {
    const allCategories: ScoreCategory[] = [
      'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
      'threeOfAKind', 'fourOfAKind', 'fullHouse',
      'smallStraight', 'largeStraight', 'choice', 'yacht'
    ];

    // 현재 점수 맵 생성
    const currentScores = new Map<string, number | null>();
    players.forEach((player, playerIndex) => {
      allCategories.forEach(category => {
        const key = `${playerIndex}-${category}`;
        currentScores.set(key, player.scoreCard[category]);
      });
    });

    // 이전 점수와 비교하여 새로 채워진 칸 찾기
    if (prevScores.size > 0) {
      for (const [key, currentScore] of currentScores) {
        const prevScore = prevScores.get(key);
        // null에서 숫자로 변경된 경우 (새로 점수가 기록된 경우)
        if ((prevScore === null || prevScore === undefined) && currentScore !== null && currentScore !== undefined) {
          const [playerIndexStr, category] = key.split('-');
          const playerIndex = parseInt(playerIndexStr);
          setHighlightedCell({ category: category as ScoreCategory, playerIndex });

          // 1.5초 후 하이라이트 제거
          setTimeout(() => {
            setHighlightedCell(null);
          }, 1500);
          break;
        }
      }
    }

    setPrevScores(currentScores);
  }, [players]);

  return (
    <div className="wood-frame p-2 sm:p-4">
      <h3 className="text-gold text-base sm:text-lg font-bold mb-2 sm:mb-3 text-center">
        점수표
      </h3>
      <div className="felt-table overflow-hidden rounded-lg overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[280px]">
          <thead>
            <tr className="bg-wood-dark/50 text-gold">
              <th className="py-1.5 sm:py-2 px-2 sm:px-3 text-left text-xs sm:text-sm">카테고리</th>
              {players.map((player, index) => (
                <th
                  key={player.id}
                  className={`py-1.5 sm:py-2 px-1 sm:px-3 text-center text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none ${
                    index === currentPlayerIndex ? 'text-gold-light' : ''
                  }`}
                >
                  <span className="truncate">{player.name.slice(0, 4)}{player.name.length > 4 ? '..' : ''}</span>
                  {index === currentPlayerIndex && (
                    <span className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs">★</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Upper Section */}
            <tr className="bg-wood/30">
              <td
                colSpan={players.length + 1}
                className="py-1 px-2 sm:px-3 text-[10px] sm:text-xs font-bold text-gold uppercase tracking-wider"
              >
                상단
              </td>
            </tr>
            {UPPER_CATEGORIES.map((category) => (
              <ScoreRow
                key={category}
                category={category}
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                possibleScore={calculateScore(category, diceValues)}
                onSelect={() => onSelectCategory(category)}
                canSelect={canSelectScore}
                highlightedCell={highlightedCell}
              />
            ))}
            {/* Upper Bonus */}
            <tr className="bg-wood/20 border-b border-wood-dark/50">
              <td className="py-1.5 sm:py-2 px-2 sm:px-3 text-left text-[10px] sm:text-xs text-gold/70">
                보너스 (63+)
              </td>
              {players.map((player) => {
                const { upper, bonus } = calculateUpperBonus(player.scoreCard);
                return (
                  <td key={player.id} className="py-1.5 sm:py-2 px-1 sm:px-3 text-center text-[10px] sm:text-xs">
                    <span className="text-wood-light/70">{upper}</span>
                    {bonus > 0 && (
                      <span className="ml-0.5 sm:ml-1 text-gold">+{bonus}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Lower Section */}
            <tr className="bg-wood/30">
              <td
                colSpan={players.length + 1}
                className="py-1 px-2 sm:px-3 text-[10px] sm:text-xs font-bold text-gold uppercase tracking-wider"
              >
                하단
              </td>
            </tr>
            {LOWER_CATEGORIES.map((category) => (
              <ScoreRow
                key={category}
                category={category}
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                possibleScore={calculateScore(category, diceValues)}
                onSelect={() => onSelectCategory(category)}
                canSelect={canSelectScore}
                highlightedCell={highlightedCell}
              />
            ))}

            {/* Total */}
            <tr className="bg-wood-dark/70 font-bold">
              <td className="py-2 sm:py-3 px-2 sm:px-3 text-left text-gold text-xs sm:text-base">합계</td>
              {players.map((player) => {
                const { bonus } = calculateUpperBonus(player.scoreCard);
                const total = calculateTotal(player.scoreCard) + bonus;
                return (
                  <td
                    key={player.id}
                    className="py-2 sm:py-3 px-1 sm:px-3 text-center text-gold text-sm sm:text-lg"
                  >
                    {total}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
