// ========================================================================
// @aperi21/sim-gravitational-acceleration
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/gravitational-acceleration).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gravitationalAccelerationSchema } from './schema';
import { initialState, type GravitationalAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gravitationalAccelerationBundle: Bundle<GravitationalAccelerationState> = {
  schema: gravitationalAccelerationSchema,
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
