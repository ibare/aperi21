// ========================================================================
// @aperi21/sim-thermal-equilibrium
// ========================================================================
// 맞붙인 뜨거운 덩이와 찬 덩이의 온도가 처음에는 빠르게, 가까워질수록 느리게
// 다가가 한 온도에서 만나고 거기서 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다 — 자유 렌더를 쓰지 않는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thermalEquilibriumSchema } from './schema';
import { initialState, type ThermalEquilibriumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thermalEquilibriumBundle: Bundle<ThermalEquilibriumState> = {
  schema: thermalEquilibriumSchema,
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
