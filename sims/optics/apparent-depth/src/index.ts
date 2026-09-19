// ========================================================================
// @aperi21/sim-apparent-depth
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { apparentDepthSchema } from './schema';
import { initialState, type ApparentDepthState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const apparentDepthBundle: Bundle<ApparentDepthState> = {
  schema: apparentDepthSchema,
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
