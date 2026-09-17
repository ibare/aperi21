// ========================================================================
// @aperi21/sim-direction-of-acceleration
// ========================================================================
// 같은 빠르기·같은 크기의 가속도 — 가속도가 속도와 같은 쪽이면 빨라지고 반대쪽이면 느려진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/direction-of-acceleration).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { directionOfAccelerationSchema } from './schema';
import { initialState, type DirectionOfAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const directionOfAccelerationBundle: Bundle<DirectionOfAccelerationState> = {
  schema: directionOfAccelerationSchema,
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
