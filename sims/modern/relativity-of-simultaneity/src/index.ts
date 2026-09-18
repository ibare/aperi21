// ========================================================================
// @aperi21/sim-relativity-of-simultaneity
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { relativityOfSimultaneitySchema } from './schema';
import { initialState, type RelativityOfSimultaneityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const relativityOfSimultaneityBundle: Bundle<RelativityOfSimultaneityState> = {
  schema: relativityOfSimultaneitySchema,
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
