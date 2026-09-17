// ========================================================================
// @aperi21/sim-trajectory-equation
// ========================================================================
// 공이 지나간 점마다 붙어 있던 시각을 지워도 경로는 그대로 남는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/trajectory-equation).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { trajectoryEquationSchema } from './schema';
import { initialState, type TrajectoryEquationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const trajectoryEquationBundle: Bundle<TrajectoryEquationState> = {
  schema: trajectoryEquationSchema,
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
