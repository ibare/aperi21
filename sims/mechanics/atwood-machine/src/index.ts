// ========================================================================
// @aperi21/sim-atwood-machine
// ========================================================================
// 두 추 질량의 합이 같으면 가속도는 두 추의 차이가 정한다 — 차이가 두 배면
// 같은 0.1 초 동안 내려오는 거리도 두 배다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/atwood-machine).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { atwoodMachineSchema } from './schema';
import { initialState, type AtwoodMachineState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const atwoodMachineBundle: Bundle<AtwoodMachineState> = {
  schema: atwoodMachineSchema,
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
