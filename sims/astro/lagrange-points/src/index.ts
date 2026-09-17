// ========================================================================
// @aperi21/sim-lagrange-points
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/lagrange-points).
// 지금은 표준 어휘 선언만으로 선다 — 자유 렌더 없음.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lagrangePointsSchema } from './schema';
import { initialState, type LagrangePointsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lagrangePointsBundle: Bundle<LagrangePointsState> = {
  schema: lagrangePointsSchema,
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
