// ========================================================================
// @aperi21/sim-polarization
// ========================================================================
// 축이 직각인 두 편광판 사이에 비스듬한 판을 끼우면 막혀 있던 빛이 되살아난다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/polarization).
// 자유 렌더 없이 선언만으로 옮겼다 — 3 차원 투영은 조각이 좌표로 계산한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { polarizationSchema } from './schema';
import { initialState, type PolarizationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const polarizationBundle: Bundle<PolarizationState> = {
  schema: polarizationSchema,
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
