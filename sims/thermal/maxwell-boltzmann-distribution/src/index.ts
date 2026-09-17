// ========================================================================
// @aperi21/sim-maxwell-boltzmann-distribution
// ========================================================================
// 온도를 올리면 분자 속력 분포가 퍼지며 내려앉는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/maxwell-boltzmann-distribution).
// 자유 렌더 없이 표준 어휘로 선언한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { maxwellBoltzmannDistributionSchema } from './schema';
import { initialState, type MaxwellBoltzmannDistributionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const maxwellBoltzmannDistributionBundle: Bundle<MaxwellBoltzmannDistributionState> = {
  schema: maxwellBoltzmannDistributionSchema,
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
