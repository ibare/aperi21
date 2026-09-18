// ========================================================================
// @aperi21/sim-angular-momentum
// ========================================================================
// 같은 팽이 셋(안 돎 · 천천히 · 빠르게)의 머리를 똑같이 친다 — 많이 도는 팽이일수록
// 축이 덜 기운다. 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { angularMomentumSchema } from './schema';
import { initialState, type AngularMomentumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const angularMomentumBundle: Bundle<AngularMomentumState> = {
  schema: angularMomentumSchema,
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
