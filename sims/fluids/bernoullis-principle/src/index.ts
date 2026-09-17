// ========================================================================
// @aperi21/sim-bernoullis-principle
// ========================================================================
// 좁은 곳에서 물이 빨라지고, 빨라진 만큼 그 위 물기둥(압력)이 내려간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/bernoullis-principle).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bernoullisPrincipleSchema } from './schema';
import { initialState, type BernoullisPrincipleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bernoullisPrincipleBundle: Bundle<BernoullisPrincipleState> = {
  schema: bernoullisPrincipleSchema,
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
