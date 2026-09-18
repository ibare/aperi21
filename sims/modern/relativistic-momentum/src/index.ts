// ========================================================================
// @aperi21/sim-relativistic-momentum
// ========================================================================
// 운동량-속도 곡선 판 — 같은 힘으로 계속 밀면 운동량은 고르게 쌓이지만
// 속도는 c 에 다가갈 뿐 넘지 못한다. 자유 렌더 없이 엔진 어휘로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { relativisticMomentumSchema } from './schema';
import { initialState, type RelativisticMomentumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const relativisticMomentumBundle: Bundle<RelativisticMomentumState> = {
  schema: relativisticMomentumSchema,
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
