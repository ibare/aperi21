// ========================================================================
// @aperi21/sim-pressure-and-container-shape
// ========================================================================
// 담긴 물의 양이 다른데 왜 바닥이 받는 압력은 같은가.
// ========================================================================

import type { Bundle, StageDef } from '@aperi21/schema';
import { controllers } from './controllers';
import { derivedValues, step } from './physics';
import { scene } from './scene';
import { pressureAndContainerShapeSchema, SCENE_BOUNDS } from './schema';
import { initialState, type PressureAndContainerShapeState } from './state';
import {
  pressureAndContainerShapeRenderers,
  pressureAndContainerShapeZHints,
} from './pressure-and-container-shape-stage';

export const pressureAndContainerShapeBundle: Bundle<PressureAndContainerShapeState> = {
  schema: pressureAndContainerShapeSchema,
  initialState,
  step,
  scene,
  controllers,
  derivedValues,
  // 물이 차올라도 프레임은 고정이다 — 글 한복판의 그림이 흔들리지 않는다 (원칙 6).
  boundsHint(_state: PressureAndContainerShapeState, _stage: StageDef) {
    return { ...SCENE_BOUNDS };
  },
  // 자유 렌더 계층 — 표준 8종에 "모양이 다른 그릇 안에서 차오르는 물" 이 없다.
  renderers: pressureAndContainerShapeRenderers,
  zHints: pressureAndContainerShapeZHints,
};

export * from './schema';
export * from './state';
export * from './physics';
export * from './scene';
export * from './controllers';
export * from './pressure-and-container-shape-stage';
