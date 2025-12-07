/**
 * GameEngineErrors
 * - UI/Client에서 엔진 기반으로 에러 처리할 때 사용
 */

export enum GameEngineError {
  NotPlayerTurn = 'NOT_PLAYER_TURN',
  CategoryAlreadyFilled = 'CATEGORY_ALREADY_FILLED',
  InvalidCategory = 'INVALID_CATEGORY',
  CannotRoll = 'CANNOT_ROLL',
}
