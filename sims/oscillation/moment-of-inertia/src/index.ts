// ========================================================================
// @aperi21/sim-moment-of-inertia
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/moment-of-inertia).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { momentOfInertiaSchema } from './schema';
import { initialState, type MomentOfInertiaState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const momentOfInertiaBundle: Bundle<MomentOfInertiaState> = {
  schema: momentOfInertiaSchema,
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
