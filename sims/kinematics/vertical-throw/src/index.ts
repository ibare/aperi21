// ========================================================================
// @aperi21/sim-vertical-throw
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/vertical-throw).
// 이관본은 표준 어휘만으로 선언한다 — 자유 렌더 없음.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { verticalThrowSchema } from './schema';
import { initialState, type VerticalThrowState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const verticalThrowBundle: Bundle<VerticalThrowState> = {
  schema: verticalThrowSchema,
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
