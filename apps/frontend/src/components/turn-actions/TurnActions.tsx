import { Category } from '@/libs';

export function TurnActions({
  canRoll,
  onRoll,
  onSelectCategory,
}: {
  canRoll: boolean;
  onRoll: () => void;
  onSelectCategory: (c: Category) => void;
}) {
  return (
    <div className="flex gap-3 mt-5">
      {canRoll && (
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onRoll}>
          Roll Dice
        </button>
      )}
    </div>
  );
}
