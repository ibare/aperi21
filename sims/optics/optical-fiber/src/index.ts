// ========================================================================
// @aperi21/sim-optical-fiber
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { opticalFiberSchema } from './schema';
import { initialState, type OpticalFiberState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const opticalFiberBundle: Bundle<OpticalFiberState> = {
  schema: opticalFiberSchema,
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
