// ========================================================================
// @aperi21/sim-pressure-and-container-shape
// ========================================================================
// 담긴 물의 양이 다른데 왜 바닥이 받는 압력은 같은가.
// ========================================================================

import type { Bundle, StageDef } from '@aperi21/schema';
import { controllers } from './controllers';
import { step } from './physics';
import { scene } from './scene';
import { pressureAndContainerShapeSchema, SCENE_BOUNDS } from './schema';
import { initialState, type PressureAndContainerShapeState } from './state';

export const pressureAndContainerShapeBundle: Bundle<PressureAndContainerShapeState> = {
  schema: pressureAndContainerShapeSchema,
  initialState,
  step,
  scene,
  controllers,
  // 물이 차올라도 프레임은 고정이다 — 글 한복판의 그림이 흔들리지 않는다 (원칙 6).
  boundsHint(_state: PressureAndContainerShapeState, _stage: StageDef) {
    return { ...SCENE_BOUNDS };
  },
};

export * from './schema';
export * from './state';
export * from './physics';
export * from './scene';
export * from './controllers';
