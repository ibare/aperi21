// ========================================================================
// @aperi21/sim-average-velocity
// ========================================================================
// 평균 속도는 구간의 두 끝만 잇는 직선의 기울기라서, 구간 끝을 옮기면 그 직선이
// 기운다.
//
// 원본은 엔진 없이 손으로 짠 캔버스였다 (tasks/piece-lab/average-velocity).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { averageVelocitySchema } from './schema';
import { initialState, type AverageVelocityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const averageVelocityBundle: Bundle<AverageVelocityState> = {
  schema: averageVelocitySchema,
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
