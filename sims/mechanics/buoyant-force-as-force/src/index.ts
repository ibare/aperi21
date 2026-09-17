// ========================================================================
// @aperi21/sim-buoyant-force-as-force
// ========================================================================
// 물에 넣어도 무게는 그대로이고, 잠긴 만큼 물이 위로 떠받쳐 용수철이 들어야 할
// 몫이 줄어든다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/buoyant-force-as-force).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { buoyantForceAsForceSchema } from './schema';
import { initialState, type BuoyantForceAsForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const buoyantForceAsForceBundle: Bundle<BuoyantForceAsForceState> = {
  schema: buoyantForceAsForceSchema,
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
