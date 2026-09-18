// ========================================================================
// @aperi21/sim-stellar-spectral-class
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { stellarSpectralClassSchema } from './schema';
import { initialState, type StellarSpectralClassState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const stellarSpectralClassBundle: Bundle<StellarSpectralClassState> = {
  schema: stellarSpectralClassSchema,
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
