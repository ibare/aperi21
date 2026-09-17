// ========================================================================
// @aperi21/sim-free-body-diagram
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/free-body-diagram).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { freeBodyDiagramSchema } from './schema';
import { initialState, type FreeBodyDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const freeBodyDiagramBundle: Bundle<FreeBodyDiagramState> = {
  schema: freeBodyDiagramSchema,
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
