// ========================================================================
// @aperi21/sim-shock-wave
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { shockWaveSchema } from './schema';
import { initialState, type ShockWaveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const shockWaveBundle: Bundle<ShockWaveState> = {
  schema: shockWaveSchema,
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
