// ========================================================================
// @aperi21/sim-uniformly-accelerated-motion
// ========================================================================
// 가속도가 일정하면 같은 시간 동안 간 거리가 매번 같은 만큼씩 늘어난다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/uniformly-accelerated-motion).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { uniformlyAcceleratedMotionSchema } from './schema';
import { initialState, type UniformlyAcceleratedMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const uniformlyAcceleratedMotionBundle: Bundle<UniformlyAcceleratedMotionState> = {
  schema: uniformlyAcceleratedMotionSchema,
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
