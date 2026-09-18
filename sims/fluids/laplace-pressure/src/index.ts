// ========================================================================
// @aperi21/sim-laplace-pressure
// ========================================================================
// 크기만 다른 비누 거품 둘을 관으로 이으면 작은 거품이 큰 거품 쪽으로 쪼그라든다 —
// 더 굽은 막이 안쪽 공기를 더 세게 누른다. 두 막이 똑같이 휘면 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { laplacePressureSchema } from './schema';
import { initialState, type LaplacePressureState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const laplacePressureBundle: Bundle<LaplacePressureState> = {
  schema: laplacePressureSchema,
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
