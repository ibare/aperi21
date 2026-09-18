// ========================================================================
// @aperi21/sim-gravitational-slingshot
// ========================================================================
// 행성 곁을 스친 탐사선은 왜 빨라지는가 — 행성과 함께 보면 같은 빠르기로 방향만
// 꺾였는데, 태양에서 보면 그 꺾인 속도에 행성의 공전 속도가 더해져 나갈 때가 더 빠르다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gravitationalSlingshotSchema } from './schema';
import { initialState, type GravitationalSlingshotState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gravitationalSlingshotBundle: Bundle<GravitationalSlingshotState> = {
  schema: gravitationalSlingshotSchema,
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
