// ========================================================================
// @aperi21/sim-perfectly-inelastic-collision
// ========================================================================
// 붙어서 함께 움직이면 속력은 왜 그만큼 느려지는가 — 달려오던 수레 위에 쌓인
// 운동량 칸 여덟 개가 붙는 순간 두 수레 위로 쏟아져 퍼진다. 칸 수는 그대로이므로
// 폭(질량)이 넓어진 만큼 높이(속력)가 낮아진다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { perfectlyInelasticCollisionSchema } from './schema';
import { initialState, type PerfectlyInelasticCollisionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const perfectlyInelasticCollisionBundle: Bundle<PerfectlyInelasticCollisionState> = {
  schema: perfectlyInelasticCollisionSchema,
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
