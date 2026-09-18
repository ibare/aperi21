// ========================================================================
// @aperi21/sim-energy-dissipation
// ========================================================================
// 마찰이 가져간 에너지는 사라지지 않는다 — 물체가 문지르고 지나간 자리마다 열로
// 쌓이고, 역학적 에너지 몫이 줄어든 만큼 열의 몫이 정확히 올라온다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { energyDissipationSchema } from './schema';
import { initialState, type EnergyDissipationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const energyDissipationBundle: Bundle<EnergyDissipationState> = {
  schema: energyDissipationSchema,
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
