// ========================================================================
// @aperi21/sim-rectilinear-propagation
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rectilinearPropagationSchema } from './schema';
import { initialState, type RectilinearPropagationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rectilinearPropagationBundle: Bundle<RectilinearPropagationState> = {
  schema: rectilinearPropagationSchema,
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
