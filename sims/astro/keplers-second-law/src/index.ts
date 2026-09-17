// ========================================================================
// @aperi21/sim-keplers-second-law
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/keplers-second-law).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { keplersSecondLawSchema } from './schema';
import { initialState, type KeplersSecondLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const keplersSecondLawBundle: Bundle<KeplersSecondLawState> = {
  schema: keplersSecondLawSchema,
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
