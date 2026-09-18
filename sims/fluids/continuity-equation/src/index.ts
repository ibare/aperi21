// ========================================================================
// @aperi21/sim-continuity-equation
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { continuityEquationSchema } from './schema';
import { initialState, type ContinuityEquationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const continuityEquationBundle: Bundle<ContinuityEquationState> = {
  schema: continuityEquationSchema,
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
