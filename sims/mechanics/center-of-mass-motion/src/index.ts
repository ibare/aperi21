// ========================================================================
// @aperi21/sim-center-of-mass-motion
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { centerOfMassMotionSchema } from './schema';
import { initialState, type CenterOfMassMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const centerOfMassMotionBundle: Bundle<CenterOfMassMotionState> = {
  schema: centerOfMassMotionSchema,
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
