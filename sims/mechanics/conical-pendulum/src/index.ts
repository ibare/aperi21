// ========================================================================
// @aperi21/sim-conical-pendulum
// ========================================================================
// 줄 길이가 달라도 같은 빠르기로 돌면 세 추는 한 높이에서 돌고, 빨리 돌수록 그
// 높이가 함께 올라간다. h = g / ω².
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/conical-pendulum).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { conicalPendulumSchema } from './schema';
import { initialState, type ConicalPendulumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const conicalPendulumBundle: Bundle<ConicalPendulumState> = {
  schema: conicalPendulumSchema,
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
