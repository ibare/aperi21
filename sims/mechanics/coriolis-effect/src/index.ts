// ========================================================================
// @aperi21/sim-coriolis-effect
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/coriolis-effect).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { coriolisEffectSchema } from './schema';
import { initialState, type CoriolisEffectState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const coriolisEffectBundle: Bundle<CoriolisEffectState> = {
  schema: coriolisEffectSchema,
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
