// ========================================================================
// @aperi21/sim-reynolds-number
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다. 자유 렌더(`renderers`) 없음.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { reynoldsNumberSchema } from './schema';
import { initialState, type ReynoldsNumberState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const reynoldsNumberBundle: Bundle<ReynoldsNumberState> = {
  schema: reynoldsNumberSchema,
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
