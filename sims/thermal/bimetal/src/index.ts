// ========================================================================
// @aperi21/sim-bimetal
// ========================================================================
// 황동 · 강철 두 장을 붙인 띠를 데우면 잘 늘어나는 황동 쪽이 바깥으로 가며 휘고,
// 실온보다 식히면 반대로 휜다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다 — 자유 렌더를 쓰지 않는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bimetalSchema } from './schema';
import { initialState, type BimetalState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bimetalBundle: Bundle<BimetalState> = {
  schema: bimetalSchema,
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
