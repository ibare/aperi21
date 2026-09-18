// ========================================================================
// @aperi21/sim-buoyancy
// ========================================================================
// 물은 왜 물체를 위로 미는가 — 아랫면이 윗면보다 깊어서 더 세게 밀린다. 그 차이가
// 부력이고, 두 면의 깊이 차가 물체 높이로 정해져 있어 깊이 가도 커지지 않는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { buoyancySchema } from './schema';
import { initialState, type BuoyancyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const buoyancyBundle: Bundle<BuoyancyState> = {
  schema: buoyancySchema,
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
