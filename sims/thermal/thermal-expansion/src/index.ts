// ========================================================================
// @aperi21/sim-thermal-expansion
// ========================================================================
// 겨울에 벌어져 있던 철로 이음매 틈이, 여름에 레일이 늘어나며 거의 닫힌다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다 — 자유 렌더를 쓰지 않는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thermalExpansionSchema } from './schema';
import { initialState, type ThermalExpansionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thermalExpansionBundle: Bundle<ThermalExpansionState> = {
  schema: thermalExpansionSchema,
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
