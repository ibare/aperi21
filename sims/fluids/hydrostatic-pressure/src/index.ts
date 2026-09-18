// ========================================================================
// @aperi21/sim-hydrostatic-pressure
// ========================================================================
// 깊이가 두 배면 물이 누르는 압력도 두 배다 — 내려가는 센서를 누르는 화살표가
// 깊이를 따라 자라고, 꼬리 자취가 수면에서 출발하는 곧은 쐐기를 그린다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { hydrostaticPressureSchema } from './schema';
import { initialState, type HydrostaticPressureState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const hydrostaticPressureBundle: Bundle<HydrostaticPressureState> = {
  schema: hydrostaticPressureSchema,
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
