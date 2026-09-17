// ========================================================================
// @aperi21/sim-balance-scale
// ========================================================================
// 무게가 절반인 추도 두 배 멀리 두면 무거운 추와 수평을 이룬다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/balance-scale).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { balanceScaleSchema } from './schema';
import { initialState, type BalanceScaleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const balanceScaleBundle: Bundle<BalanceScaleState> = {
  schema: balanceScaleSchema,
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
