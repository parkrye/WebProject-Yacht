/**
 * Central export hub for game engine libraries
 * - Keeps import paths clean across backend/frontend/engine/UI.
 * - Only re-exports public modules ? never add implementation logic here.
 */

// ---------- Types ----------
export * from './types/category.enum';

// ---------- Entities ----------
export * from './entities/player';
export * from './entities/dice-set';
export * from './entities/scoreCard';
export * from './entities/game-state';

// ---------- Services ----------
export * from './services/dice.service';
export * from './services/score-calculator.service';
export * from './services/game-flow.service';
export * from './services/turn.service';

// ---------- Constants ----------
export * from './constants/score-map';

export * from './game-engine/game-engine';
export * from './game-engine/game-engine-errors';