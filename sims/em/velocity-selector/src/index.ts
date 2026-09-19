// ========================================================================
// @aperi21/sim-velocity-selector
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { velocitySelectorSchema } from './schema';
import { initialState, type VelocitySelectorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const velocitySelectorBundle: Bundle<VelocitySelectorState> = {
  schema: velocitySelectorSchema,
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
