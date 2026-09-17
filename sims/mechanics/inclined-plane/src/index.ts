// ========================================================================
// @aperi21/sim-inclined-plane
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/inclined-plane).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { inclinedPlaneSchema } from './schema';
import { initialState, type InclinedPlaneState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const inclinedPlaneBundle: Bundle<InclinedPlaneState> = {
  schema: inclinedPlaneSchema,
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
