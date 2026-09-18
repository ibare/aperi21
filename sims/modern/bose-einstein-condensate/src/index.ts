// ========================================================================
// @aperi21/sim-bose-einstein-condensate
// ========================================================================
// 보손 원자 기체를 식힌다. Tc 위에서는 구름과 속도 분포가 매끄럽게 좁아지고,
// Tc 아래에서는 원자들이 가장 낮은 한 상태로 몰려 분포 한가운데에 봉우리가 선다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { boseEinsteinCondensateSchema } from './schema';
import { initialState, type BoseEinsteinCondensateState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const boseEinsteinCondensateBundle: Bundle<BoseEinsteinCondensateState> = {
  schema: boseEinsteinCondensateSchema,
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
