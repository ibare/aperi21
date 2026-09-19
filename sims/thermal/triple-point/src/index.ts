// ========================================================================
// @aperi21/sim-triple-point
// ========================================================================
// 삼중점(0.01 ℃ · 611.657 Pa)에서만 얼음 · 물 · 김이 한 그릇에 함께 머물고,
// 그 점에서 조금만 벗어나도 하나만 남는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { triplePointSchema } from './schema';
import { initialState, type TriplePointState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const triplePointBundle: Bundle<TriplePointState> = {
  schema: triplePointSchema,
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
