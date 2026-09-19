// ========================================================================
// @aperi21/sim-temperature-and-resistance
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { temperatureAndResistanceSchema } from './schema';
import { initialState, type TemperatureAndResistanceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const temperatureAndResistanceBundle: Bundle<TemperatureAndResistanceState> = {
  schema: temperatureAndResistanceSchema,
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
