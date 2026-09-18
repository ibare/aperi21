// ========================================================================
// @aperi21/sim-damping-regimes
// ========================================================================
// 감쇠의 세 양상 — 같은 용수철 셋을 같은 만큼 당겼다 동시에 놓는다. 감쇠를 키우면
// 넘실거림이 사라지고, 임계 감쇠가 가장 먼저 멎으며, 더 키우면 오히려 늦다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { dampingRegimesSchema } from './schema';
import { initialState, type DampingRegimesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const dampingRegimesBundle: Bundle<DampingRegimesState> = {
  schema: dampingRegimesSchema,
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
