// ========================================================================
// @aperi21/sim-moon-phases
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/moon-phases).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { moonPhasesSchema } from './schema';
import { initialState, type MoonPhasesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const moonPhasesBundle: Bundle<MoonPhasesState> = {
  schema: moonPhasesSchema,
  initialState,
  step,
  scene,
  controllers,
  boundsHint,
};

export * from './schema';
export * from './state';
export * from './physics';
export * from './scene';
export * from './controllers';
