// ========================================================================
// @aperi21/sim-star-life-cycle
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { starLifeCycleSchema } from './schema';
import { initialState, type StarLifeCycleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const starLifeCycleBundle: Bundle<StarLifeCycleState> = {
  schema: starLifeCycleSchema,
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
