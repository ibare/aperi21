// ========================================================================
// @aperi21/sim-rolling-without-slipping
// ========================================================================
// 미끄러지지 않고 구르는 바퀴(v = ωR)는 바닥에 닿은 점이 그 순간 멈춰 있다 —
// 앞으로 가는 v 와 뒤로 도는 ωR 이 맞비긴다. 덜 도는 바퀴와 나란히 굴려 견준다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rollingWithoutSlippingSchema } from './schema';
import { initialState, type RollingWithoutSlippingState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rollingWithoutSlippingBundle: Bundle<RollingWithoutSlippingState> = {
  schema: rollingWithoutSlippingSchema,
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
