// ========================================================================
// @aperi21/sim-inelastic-collision
// ========================================================================
// 비탄성 충돌 — 같은 수레 세 쌍이 부딪히는 면만 달리해 나란히 부딪힌다. 부딪힌
// 뒤 두 수레 사이가 덜 벌어지는 쌍일수록 운동 에너지 막대에서 사라진 칸이 길다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { inelasticCollisionSchema } from './schema';
import { initialState, type InelasticCollisionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const inelasticCollisionBundle: Bundle<InelasticCollisionState> = {
  schema: inelasticCollisionSchema,
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
