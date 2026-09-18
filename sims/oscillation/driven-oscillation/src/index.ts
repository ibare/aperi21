// ========================================================================
// @aperi21/sim-driven-oscillation
// ========================================================================
// 강제 진동 — 용수철에 매단 추를 손으로 흔들면 추는 제 박자가 아니라 손의
// 박자로 흔들린다. 느리게 흔들면 손을 따라 같은 쪽으로, 빠르게 흔들면 반대쪽으로.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { drivenOscillationSchema } from './schema';
import { initialState, type DrivenOscillationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const drivenOscillationBundle: Bundle<DrivenOscillationState> = {
  schema: drivenOscillationSchema,
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
