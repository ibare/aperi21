// ========================================================================
// @aperi21/sim-spring-force
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/spring-force).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { springForceSchema } from './schema';
import { initialState, type SpringForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const springForceBundle: Bundle<SpringForceState> = {
  schema: springForceSchema,
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
