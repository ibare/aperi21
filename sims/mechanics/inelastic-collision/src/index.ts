// ========================================================================
// @aperi21/sim-inelastic-collision
// ========================================================================
// 비탄성 충돌 — 바닥에 떨어뜨린 공 하나가 여러 번 튄다. 부딪힐 때마다 들어온 빠르기의
// e 배로만 튀어 나와, 꼭짓점이 매번 e² 배로 낮아진다. 모자란 높이만큼이 사라진 에너지다.
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
