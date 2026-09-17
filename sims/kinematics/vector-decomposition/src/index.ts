// ========================================================================
// @aperi21/sim-vector-decomposition
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/vector-decomposition).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { vectorDecompositionSchema } from './schema';
import { initialState, type VectorDecompositionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const vectorDecompositionBundle: Bundle<VectorDecompositionState> = {
  schema: vectorDecompositionSchema,
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
