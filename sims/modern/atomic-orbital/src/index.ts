// ========================================================================
// @aperi21/sim-atomic-orbital
// ========================================================================
// 궤도 그림은 전자가 도는 길이 아니라, 발견 자리가 쌓인 분포다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/atomic-orbital).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { atomicOrbitalSchema } from './schema';
import { initialState, type AtomicOrbitalState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const atomicOrbitalBundle: Bundle<AtomicOrbitalState> = {
  schema: atomicOrbitalSchema,
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
