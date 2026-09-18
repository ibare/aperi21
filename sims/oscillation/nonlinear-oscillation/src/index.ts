// ========================================================================
// @aperi21/sim-nonlinear-oscillation
// ========================================================================
// 같은 단단해지는 용수철을 조금 · 크게 흔들어 기록을 나란히 적는다 — 작게 흔들면
// 비례하는 용수철의 사인(점선)을 따라가고, 크게 흔들면 봉우리가 뾰족해지고 앞질러 간다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { nonlinearOscillationSchema } from './schema';
import { initialState, type NonlinearOscillationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const nonlinearOscillationBundle: Bundle<NonlinearOscillationState> = {
  schema: nonlinearOscillationSchema,
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
