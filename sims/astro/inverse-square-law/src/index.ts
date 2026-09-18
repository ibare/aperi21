// ========================================================================
// @aperi21/sim-inverse-square-law
// ========================================================================
// 한 점에서 모든 방향으로 고르게 나간 알갱이는 수가 그대로인데 구면 넓이가
// 반지름의 제곱으로 커진다 — 고정된 창 하나에 드는 몫이 1/r² 이 된다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { inverseSquareLawSchema } from './schema';
import { initialState, type InverseSquareLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const inverseSquareLawBundle: Bundle<InverseSquareLawState> = {
  schema: inverseSquareLawSchema,
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
