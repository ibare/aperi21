// ========================================================================
// @aperi21/sim-non-inertial-frame
// ========================================================================
// 버스가 출발할 때 뒤로 밀려 보이는 공은, 길에서 보면 제자리에 남아 있다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/non-inertial-frame).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { nonInertialFrameSchema } from './schema';
import { initialState, type NonInertialFrameState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const nonInertialFrameBundle: Bundle<NonInertialFrameState> = {
  schema: nonInertialFrameSchema,
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
