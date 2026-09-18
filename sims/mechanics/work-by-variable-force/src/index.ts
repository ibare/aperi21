// ========================================================================
// @aperi21/sim-work-by-variable-force
// ========================================================================
// 힘이 자리마다 다르면 한 일은 어디에 있는가 — 상자가 조금 갈 때마다 그 자리의
// 힘 × 그 거리만큼 띠가 상자 바로 아래 그래프에 쌓이고, 다 쌓인 곡선 아래 넓이가 일이다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { workByVariableForceSchema } from './schema';
import { initialState, type WorkByVariableForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const workByVariableForceBundle: Bundle<WorkByVariableForceState> = {
  schema: workByVariableForceSchema,
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
