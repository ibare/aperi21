// ========================================================================
// @aperi21/sim-tangential-normal-acceleration
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/tangential-normal-acceleration).
// 자유 렌더 없이 표준 어휘 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { tangentialNormalAccelerationSchema } from './schema';
import { initialState, type TangentialNormalAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const tangentialNormalAccelerationBundle: Bundle<TangentialNormalAccelerationState> = {
  schema: tangentialNormalAccelerationSchema,
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
