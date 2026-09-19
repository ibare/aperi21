// ========================================================================
// @aperi21/sim-pv-diagram
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { pvDiagramSchema } from './schema';
import { initialState, type PvDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const pvDiagramBundle: Bundle<PvDiagramState> = {
  schema: pvDiagramSchema,
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
