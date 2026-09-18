// ========================================================================
// @aperi21/sim-compton-scattering
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { comptonScatteringSchema } from './schema';
import { initialState, type ComptonScatteringState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const comptonScatteringBundle: Bundle<ComptonScatteringState> = {
  schema: comptonScatteringSchema,
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
