// ========================================================================
// @aperi21/sim-newtons-third-law
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/newtons-third-law).
// 자유 렌더 계층 없이 표준 어휘와 시간표 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { newtonsThirdLawSchema } from './schema';
import { initialState, type NewtonsThirdLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const newtonsThirdLawBundle: Bundle<NewtonsThirdLawState> = {
  schema: newtonsThirdLawSchema,
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
