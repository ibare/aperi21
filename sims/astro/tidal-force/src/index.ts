// ========================================================================
// @aperi21/sim-tidal-force
// ========================================================================
// 천체로 함께 떨어지는 먼지 구름은 가까운 쪽이 더 세게, 먼 쪽이 더 약하게 끌려
// 구름 가운데에서 보면 양쪽으로 늘어난다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/tidal-force).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { tidalForceSchema } from './schema';
import { initialState, type TidalForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const tidalForceBundle: Bundle<TidalForceState> = {
  schema: tidalForceSchema,
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
