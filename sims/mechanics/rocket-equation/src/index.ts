// ========================================================================
// @aperi21/sim-rocket-equation
// ========================================================================
// 칸마다 같은 양의 연료를 같은 빠르기로 뿜는데, 한 칸이 붙이는 속도는 뒤로 갈수록
// 커진다 — 먼저 태운 칸은 아직 실려 있는 연료까지 함께 밀어야 했기 때문이다.
//
// 엔진 어휘 위에서 바로 지었다 (자유 구현 원본 없음, tasks/piece-lab/rocket-equation).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rocketEquationSchema } from './schema';
import { initialState, type RocketEquationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rocketEquationBundle: Bundle<RocketEquationState> = {
  schema: rocketEquationSchema,
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
