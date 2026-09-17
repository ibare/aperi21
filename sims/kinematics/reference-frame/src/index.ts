// ========================================================================
// @aperi21/sim-reference-frame
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/reference-frame).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { referenceFrameSchema } from './schema';
import { initialState, type ReferenceFrameState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const referenceFrameBundle: Bundle<ReferenceFrameState> = {
  schema: referenceFrameSchema,
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
