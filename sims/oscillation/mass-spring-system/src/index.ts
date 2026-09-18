// ========================================================================
// @aperi21/sim-mass-spring-system
// ========================================================================
// 용수철 진자 — 같은 용수철 셋을 동시에 놓는다. 두 배 멀리 당긴 추도 같은 순간
// 돌아오고, 네 배 무거운 추는 두 번에 한 번 돌아온다. 주기는 질량이 정한다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { massSpringSystemSchema } from './schema';
import { initialState, type MassSpringSystemState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const massSpringSystemBundle: Bundle<MassSpringSystemState> = {
  schema: massSpringSystemSchema,
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
