// ========================================================================
// @aperi21/sim-average-acceleration
// ========================================================================
// 도중에 속도가 어떻게 변했든, 같은 시간 동안 처음과 끝 속도가 같으면 평균
// 가속도(처음과 끝을 잇는 기울기)는 같다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/average-acceleration).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { averageAccelerationSchema } from './schema';
import { initialState, type AverageAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const averageAccelerationBundle: Bundle<AverageAccelerationState> = {
  schema: averageAccelerationSchema,
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
