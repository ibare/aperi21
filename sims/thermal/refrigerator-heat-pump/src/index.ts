// ========================================================================
// @aperi21/sim-refrigerator-heat-pump
// ========================================================================
// 일을 넣으면 찬 냉장고 안에서 열이 빠져 더운 부엌으로 옮겨지고, 부엌에 닿는 열은
// 뺀 열과 넣은 일의 합이다. 끊으면 열은 저절로 거꾸로 샌다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { refrigeratorHeatPumpSchema } from './schema';
import { initialState, type RefrigeratorHeatPumpState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const refrigeratorHeatPumpBundle: Bundle<RefrigeratorHeatPumpState> = {
  schema: refrigeratorHeatPumpSchema,
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
