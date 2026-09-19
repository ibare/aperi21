// ========================================================================
// @aperi21/sim-entropy-and-irreversibility
// ========================================================================
// 튀다 멈춘 공과 그 장면을 거꾸로 돌린 것 — 흩어진 바닥 떨림이 한 점으로 모여 공을 띄운다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { entropyAndIrreversibilitySchema } from './schema';
import { initialState, type EntropyAndIrreversibilityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const entropyAndIrreversibilityBundle: Bundle<EntropyAndIrreversibilityState> = {
  schema: entropyAndIrreversibilitySchema,
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
