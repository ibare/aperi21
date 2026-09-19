// ========================================================================
// @aperi21/sim-magnetic-field
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { magneticFieldSchema } from './schema';
import { initialState, type MagneticFieldState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const magneticFieldBundle: Bundle<MagneticFieldState> = {
  schema: magneticFieldSchema,
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
