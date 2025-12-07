/**
 * DiceSet
 * - 주사위 5개의 현재 값과 "고정(keep)" 상태를 보관하는 엔티티
 * - 계산/점수/턴 진행 로직은 포함하지 않고, 주사위 상태 보관과 변경 책임만 가진다 (SRP).
 */

export class DiceSet {
  private static readonly DICE_COUNT = 5;
  private static readonly MIN_VALUE = 1;
  private static readonly MAX_VALUE = 6;

  // 예: [1, 4, 2, 6, 5]
  public readonly values: number[];

  // 예: [false, true, false, false, true]
  public readonly keepFlags: boolean[];

  constructor(values?: number[], keepFlags?: boolean[]) {
    this.values = values ?? Array(DiceSet.DICE_COUNT).fill(0);
    this.keepFlags = keepFlags ?? Array(DiceSet.DICE_COUNT).fill(false);

    if (this.values.length !== DiceSet.DICE_COUNT) {
      throw new Error(`DiceSet.values length must be ${DiceSet.DICE_COUNT}`);
    }
    if (this.keepFlags.length !== DiceSet.DICE_COUNT) {
      throw new Error(`DiceSet.keepFlags length must be ${DiceSet.DICE_COUNT}`);
    }
  }

  /**
   * 선택한 인덱스들을 고정/해제한 새로운 DiceSet 반환 (불변성 유지)
   */
  setKeepFlags(indexesToKeep: number[]): DiceSet {
    const nextFlags = this.keepFlags.map((_, index) => indexesToKeep.includes(index));
    return new DiceSet([...this.values], nextFlags);
  }

  /**
   * 굴림 결과를 반영한 새로운 DiceSet 반환
   * keepFlags가 false인 값만 랜덤으로 굴림
   * (실제 "턴 검증/굴림 가능한 횟수" 로직은 TurnService에서 담당)
   */
  roll(): DiceSet {
    const nextValues = this.values.map((value, index) => {
      if (this.keepFlags[index]) return value;
      return DiceSet.randomValue();
    });
    return new DiceSet(nextValues, [...this.keepFlags]);
  }

  /**
   * 유지 상태 초기화 (다음 턴 시작 시 사용)
   */
  resetKeepFlags(): DiceSet {
    return new DiceSet([...this.values], Array(DiceSet.DICE_COUNT).fill(false));
  }

  /**
   * 정적 util ? 주사위 하나의 랜덤 결과 반환
   */
  private static randomValue(): number {
    return (
      Math.floor(
        Math.random() * (DiceSet.MAX_VALUE - DiceSet.MIN_VALUE + 1),
      ) + DiceSet.MIN_VALUE
    );
  }
}
