// ========================================================================
// @aperi21/sim-snells-law
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { snellsLawSchema } from './schema';
import { initialState, type SnellsLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const snellsLawBundle: Bundle<SnellsLawState> = {
  schema: snellsLawSchema,
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
