// ========================================================================
// @aperi21/sim-ramp-energy
// ========================================================================
// 같은 높이에서 출발한 공은 어떤 길로 내려오든 바닥에 내려서는 속력이 같다 —
// 먼저 도착한 공이 계속 앞설 뿐, 간격은 더 벌어지지 않는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/ramp-energy).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rampEnergySchema } from './schema';
import { initialState, type RampEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rampEnergyBundle: Bundle<RampEnergyState> = {
  schema: rampEnergySchema,
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
