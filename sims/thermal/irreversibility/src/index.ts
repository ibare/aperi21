// ========================================================================
// @aperi21/sim-irreversibility
// ========================================================================
// 튀다 멈춘 공과 그 장면을 거꾸로 돌린 것 — 흩어진 바닥 떨림이 한 점으로 모여 공을 띄운다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { irreversibilitySchema } from './schema';
import { initialState, type IrreversibilityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const irreversibilityBundle: Bundle<IrreversibilityState> = {
  schema: irreversibilitySchema,
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
