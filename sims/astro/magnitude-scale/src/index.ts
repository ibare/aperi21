// ========================================================================
// @aperi21/sim-magnitude-scale
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { magnitudeScaleSchema } from './schema';
import { initialState, type MagnitudeScaleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const magnitudeScaleBundle: Bundle<MagnitudeScaleState> = {
  schema: magnitudeScaleSchema,
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
