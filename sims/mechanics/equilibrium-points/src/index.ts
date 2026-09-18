// ========================================================================
// @aperi21/sim-equilibrium-points
// ========================================================================
// 셋 다 멈춰 있는 평형인데 무엇이 안정 · 불안정 · 중립을 가르는가 — 똑같이
// 조금 옮기면 골은 되밀고, 마루는 더 밀어내고, 평지는 밀지 않는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { equilibriumPointsSchema } from './schema';
import { initialState, type EquilibriumPointsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const equilibriumPointsBundle: Bundle<EquilibriumPointsState> = {
  schema: equilibriumPointsSchema,
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
