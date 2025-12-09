import type { Player, ScoreCategory, ScoreCard } from '../../types/game.types';
import { SCORE_CATEGORIES } from '../../types/game.types';

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
  diceValues: number[];
  onSelectCategory: (category: ScoreCategory) => void;
  canSelectScore: boolean;
}

// 점수 계산 함수들
function calculatePossibleScore(category: ScoreCategory, dice: number[]): number {
  const counts = new Map<number, number>();
  dice.forEach((d) => counts.set(d, (counts.get(d) || 0) + 1));
  const sum = dice.reduce((a, b) => a + b, 0);
  const sortedDice = [...dice].sort((a, b) => a - b);

  switch (category) {
    case 'ones':
      return dice.filter((d) => d === 1).length * 1;
    case 'twos':
      return dice.filter((d) => d === 2).length * 2;
    case 'threes':
      return dice.filter((d) => d === 3).length * 3;
    case 'fours':
      return dice.filter((d) => d === 4).length * 4;
    case 'fives':
      return dice.filter((d) => d === 5).length * 5;
    case 'sixes':
      return dice.filter((d) => d === 6).length * 6;
    case 'threeOfAKind': {
      const hasThree = [...counts.values()].some((c) => c >= 3);
      return hasThree ? sum : 0;
    }
    case 'fourOfAKind': {
      const hasFour = [...counts.values()].some((c) => c >= 4);
      return hasFour ? sum : 0;
    }
    case 'fullHouse': {
      const values = [...counts.values()].sort((a, b) => b - a);
      return values[0] === 3 && values[1] === 2 ? 25 : 0;
    }
    case 'smallStraight': {
      const unique = new Set(sortedDice);
      const straights = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      return straights.some((s) => s.every((n) => unique.has(n))) ? 15 : 0;
    }
    case 'largeStraight': {
      const unique = [...new Set(sortedDice)];
      const isLarge =
        (unique.length === 5 && unique[4] - unique[0] === 4);
      return isLarge ? 30 : 0;
    }
    case 'choice':
      return sum;
    case 'yacht': {
      const allSame = [...counts.values()].some((c) => c === 5);
      return allSame ? 50 : 0;
    }
    default:
      return 0;
  }
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
}: {
  category: ScoreCategory;
  players: Player[];
  currentPlayerIndex: number;
  possibleScore: number;
  onSelect: () => void;
  canSelect: boolean;
}) {
  const currentPlayer = players[currentPlayerIndex];
  const scoreValue = currentPlayer?.scoreCard[category];
  const isAvailable = scoreValue === null || scoreValue === undefined;
  const isClickable = canSelect && isAvailable;

  return (
    <tr
      className={`
        border-b border-wood-dark/30 transition-colors
        ${isClickable ? 'hover:bg-gold/10 cursor-pointer' : ''}
      `}
      onClick={isClickable ? onSelect : undefined}
    >
      <td className="py-2 px-3 text-left font-medium">
        {getCategoryLabel(category)}
      </td>
      {players.map((player, index) => {
        const score = player.scoreCard[category];
        const isCurrentPlayer = index === currentPlayerIndex;
        const cellIsAvailable = score === null || score === undefined;
        const showPossible = isCurrentPlayer && cellIsAvailable && canSelect;

        return (
          <td
            key={player.id}
            className={`
              py-2 px-3 text-center
              ${isCurrentPlayer ? 'bg-gold/5' : ''}
              ${isClickable && isCurrentPlayer ? 'text-gold font-bold' : ''}
            `}
          >
            {score !== null && score !== undefined ? (
              <span className="text-white">{score}</span>
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
  return (
    <div className="wood-frame p-4">
      <h3 className="text-gold text-lg font-bold mb-3 text-center">
        Score Card
      </h3>
      <div className="felt-table overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-wood-dark/50 text-gold">
              <th className="py-2 px-3 text-left">Category</th>
              {players.map((player, index) => (
                <th
                  key={player.id}
                  className={`py-2 px-3 text-center ${
                    index === currentPlayerIndex ? 'text-gold-light' : ''
                  }`}
                >
                  {player.name}
                  {index === currentPlayerIndex && (
                    <span className="ml-1 text-xs">★</span>
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
                className="py-1 px-3 text-xs font-bold text-gold uppercase tracking-wider"
              >
                Upper Section
              </td>
            </tr>
            {UPPER_CATEGORIES.map((category) => (
              <ScoreRow
                key={category}
                category={category}
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                possibleScore={calculatePossibleScore(category, diceValues)}
                onSelect={() => onSelectCategory(category)}
                canSelect={canSelectScore}
              />
            ))}
            {/* Upper Bonus */}
            <tr className="bg-wood/20 border-b border-wood-dark/50">
              <td className="py-2 px-3 text-left text-xs text-gold/70">
                Bonus (63+ = 35pts)
              </td>
              {players.map((player) => {
                const { upper, bonus } = calculateUpperBonus(player.scoreCard);
                return (
                  <td key={player.id} className="py-2 px-3 text-center text-xs">
                    <span className="text-wood-light/70">{upper}/63</span>
                    {bonus > 0 && (
                      <span className="ml-1 text-gold">+{bonus}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Lower Section */}
            <tr className="bg-wood/30">
              <td
                colSpan={players.length + 1}
                className="py-1 px-3 text-xs font-bold text-gold uppercase tracking-wider"
              >
                Lower Section
              </td>
            </tr>
            {LOWER_CATEGORIES.map((category) => (
              <ScoreRow
                key={category}
                category={category}
                players={players}
                currentPlayerIndex={currentPlayerIndex}
                possibleScore={calculatePossibleScore(category, diceValues)}
                onSelect={() => onSelectCategory(category)}
                canSelect={canSelectScore}
              />
            ))}

            {/* Total */}
            <tr className="bg-wood-dark/70 font-bold">
              <td className="py-3 px-3 text-left text-gold">TOTAL</td>
              {players.map((player) => {
                const { bonus } = calculateUpperBonus(player.scoreCard);
                const total = calculateTotal(player.scoreCard) + bonus;
                return (
                  <td
                    key={player.id}
                    className="py-3 px-3 text-center text-gold text-lg"
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
