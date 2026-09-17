// ========================================================================
// @aperi21/sim-equilibrium-of-forces
// ========================================================================
// 여러 힘이 당기는 매듭은 세 힘의 화살표를 끝과 끝으로 이었을 때 닫히는 자리까지
// 끌려가 거기서 멈춘다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/equilibrium-of-forces).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { equilibriumOfForcesSchema } from './schema';
import { initialState, type EquilibriumOfForcesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const equilibriumOfForcesBundle: Bundle<EquilibriumOfForcesState> = {
  schema: equilibriumOfForcesSchema,
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
