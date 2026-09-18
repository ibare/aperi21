// ========================================================================
// @aperi21/sim-roche-limit
// ========================================================================
// 로슈 한계 — 알갱이 덩어리를 붙잡는 제 중력은 그대로인데 떼어 내는 조석력은
// 1/d³ 로 자란다. 두 화살표가 같아지는 거리 안쪽에서 덩어리가 풀려 고리로 번진다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rocheLimitSchema } from './schema';
import { initialState, type RocheLimitState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rocheLimitBundle: Bundle<RocheLimitState> = {
  schema: rocheLimitSchema,
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
