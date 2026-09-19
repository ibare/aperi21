// ========================================================================
// @aperi21/sim-statistical-fluctuation
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { statisticalFluctuationSchema } from './schema';
import { initialState, type StatisticalFluctuationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const statisticalFluctuationBundle: Bundle<StatisticalFluctuationState> = {
  schema: statisticalFluctuationSchema,
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
