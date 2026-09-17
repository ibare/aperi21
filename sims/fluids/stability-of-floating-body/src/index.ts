// ========================================================================
// @aperi21/sim-stability-of-floating-body
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/stability-of-floating-body).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { stabilityOfFloatingBodySchema } from './schema';
import { initialState, type StabilityOfFloatingBodyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const stabilityOfFloatingBodyBundle: Bundle<StabilityOfFloatingBodyState> = {
  schema: stabilityOfFloatingBodySchema,
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
