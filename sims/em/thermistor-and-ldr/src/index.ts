// ========================================================================
// @aperi21/sim-thermistor-and-ldr
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thermistorAndLdrSchema } from './schema';
import { initialState, type ThermistorAndLdrState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thermistorAndLdrBundle: Bundle<ThermistorAndLdrState> = {
  schema: thermistorAndLdrSchema,
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
