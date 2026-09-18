// ========================================================================
// @aperi21/sim-gravitational-potential-energy
// ========================================================================
// 들어 올린 만큼 높이에 저장되고, 내려오며 그만큼 돌려준다 — 같은 추를 두 배
// 높이에서 놓으면 같은 땅에 말뚝을 두 배 깊이 박는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gravitationalPotentialEnergySchema } from './schema';
import { initialState, type GravitationalPotentialEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gravitationalPotentialEnergyBundle: Bundle<GravitationalPotentialEnergyState> = {
  schema: gravitationalPotentialEnergySchema,
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
