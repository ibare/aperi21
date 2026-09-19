// ========================================================================
// @aperi21/sim-rayleigh-scattering
// ========================================================================
// 파랑은 빨강보다 약 5.9배 더 흩어진다 — 그래서 한낮의 하늘은 파랗고, 해가 낮아
// 빛이 공기를 길게 지나면 파랑이 먼저 다 흩어져 남은 빛이 붉다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rayleighScatteringSchema } from './schema';
import { initialState, type RayleighScatteringState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rayleighScatteringBundle: Bundle<RayleighScatteringState> = {
  schema: rayleighScatteringSchema,
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
