// ========================================================================
// @aperi21/sim-newtons-second-law
// ========================================================================
// 힘을 두 배로 하면 두 배가 되는 것은 속도가 아니라 1초마다 붙는 속도다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/newtons-second-law).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { newtonsSecondLawSchema } from './schema';
import { initialState, type NewtonsSecondLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const newtonsSecondLawBundle: Bundle<NewtonsSecondLawState> = {
  schema: newtonsSecondLawSchema,
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
