// ========================================================================
// @aperi21/sim-conservation-of-momentum
// ========================================================================
// 운동량 보존 — 두 수레가 서로 미는 동안 두 운동량 화살표를 이어 붙인 끝은
// 움직이지 않는다. 계 밖의 벽이 A 를 밀 때에만 그 끝이 옮겨 간다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { conservationOfMomentumSchema } from './schema';
import { initialState, type ConservationOfMomentumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const conservationOfMomentumBundle: Bundle<ConservationOfMomentumState> = {
  schema: conservationOfMomentumSchema,
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
