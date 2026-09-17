// ========================================================================
// @aperi21/sim-centripetal-force
// ========================================================================
// 줄이 당기는 힘이 사라지면 공은 바깥으로 튀어 나가지 않고, 놓인 순간의 접선을
// 따라 곧게 날아간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/centripetal-force).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { centripetalForceSchema } from './schema';
import { initialState, type CentripetalForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const centripetalForceBundle: Bundle<CentripetalForceState> = {
  schema: centripetalForceSchema,
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
