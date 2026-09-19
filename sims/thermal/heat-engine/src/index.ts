// ========================================================================
// @aperi21/sim-heat-engine
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { heatEngineSchema } from './schema';
import { initialState, type HeatEngineState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const heatEngineBundle: Bundle<HeatEngineState> = {
  schema: heatEngineSchema,
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
