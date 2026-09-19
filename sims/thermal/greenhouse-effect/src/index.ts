// ========================================================================
// @aperi21/sim-greenhouse-effect
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { greenhouseEffectSchema } from './schema';
import { initialState, type GreenhouseEffectState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const greenhouseEffectBundle: Bundle<GreenhouseEffectState> = {
  schema: greenhouseEffectSchema,
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
