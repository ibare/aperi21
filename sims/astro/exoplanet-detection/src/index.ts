// ========================================================================
// @aperi21/sim-exoplanet-detection
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { exoplanetDetectionSchema } from './schema';
import { initialState, type ExoplanetDetectionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const exoplanetDetectionBundle: Bundle<ExoplanetDetectionState> = {
  schema: exoplanetDetectionSchema,
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
