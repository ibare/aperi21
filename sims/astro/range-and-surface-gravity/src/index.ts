// ========================================================================
// @aperi21/sim-range-and-surface-gravity
// ========================================================================
// 같은 발사가 중력이 약한 곳에서 더 멀리 간다 — 같은 각도 · 같은 속력으로 떠난
// 두 공이 가로로는 똑같은 속력으로 나아가는데, 달의 공은 여섯 배 오래 떠 있어
// 눈금 여섯 칸을 지나 떨어진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rangeAndSurfaceGravitySchema } from './schema';
import { initialState, type RangeAndSurfaceGravityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rangeAndSurfaceGravityBundle: Bundle<RangeAndSurfaceGravityState> = {
  schema: rangeAndSurfaceGravitySchema,
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
