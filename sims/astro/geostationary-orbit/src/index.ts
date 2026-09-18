// ========================================================================
// @aperi21/sim-geostationary-orbit
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { geostationaryOrbitSchema } from './schema';
import { initialState, type GeostationaryOrbitState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const geostationaryOrbitBundle: Bundle<GeostationaryOrbitState> = {
  schema: geostationaryOrbitSchema,
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
