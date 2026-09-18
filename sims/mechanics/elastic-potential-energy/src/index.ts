// ========================================================================
// @aperi21/sim-elastic-potential-energy
// ========================================================================
// 같은 용수철을 두 배 깊이 누르면 공은 두 배가 아니라 네 배 높이 튀어 오른다 —
// 눌린 용수철이 담고 있던 에너지가 누른 깊이의 제곱을 따른다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { elasticPotentialEnergySchema } from './schema';
import { initialState, type ElasticPotentialEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const elasticPotentialEnergyBundle: Bundle<ElasticPotentialEnergyState> = {
  schema: elasticPotentialEnergySchema,
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
