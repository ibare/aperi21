// ========================================================================
// @aperi21/sim-uniform-circular-motion
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/uniform-circular-motion).
// 자유 렌더 없이 어휘 넷(trajectory · vector · body · readout)으로 선언한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { uniformCircularMotionSchema } from './schema';
import { initialState, type UniformCircularMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const uniformCircularMotionBundle: Bundle<UniformCircularMotionState> = {
  schema: uniformCircularMotionSchema,
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
