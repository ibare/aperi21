// ========================================================================
// @aperi21/sim-gas-pressure
// ========================================================================
// 압력은 분자들이 벽을 때리는 두드림의 합이고, 온도를 올리면 분자가 빨라져
// 그 합이 커진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/gas-pressure).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gasPressureSchema } from './schema';
import { initialState, type GasPressureState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gasPressureBundle: Bundle<GasPressureState> = {
  schema: gasPressureSchema,
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
