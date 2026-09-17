// ========================================================================
// @aperi21/sim-equipotential-surface
// ========================================================================
// 전위를 높이로 세운 지형에서 전기장은 가장 가파른 내리막이므로, 양전하에서 풀려난
// 시험 전하는 등전위선을 만날 때마다 직각으로 가로지른다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/equipotential-surface).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { equipotentialSurfaceSchema } from './schema';
import { initialState, type EquipotentialSurfaceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const equipotentialSurfaceBundle: Bundle<EquipotentialSurfaceState> = {
  schema: equipotentialSurfaceSchema,
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
