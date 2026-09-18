// ========================================================================
// @aperi21/sim-band-theory
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bandTheorySchema } from './schema';
import { initialState, type BandTheoryState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bandTheoryBundle: Bundle<BandTheoryState> = {
  schema: bandTheorySchema,
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
