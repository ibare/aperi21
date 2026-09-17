// ========================================================================
// @aperi21/sim-double-slit-with-electrons
// ========================================================================
// 전자를 한 번에 하나씩 보내도 점이 쌓여 간섭 줄무늬가 된다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/double-slit-with-electrons).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 것은 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { doubleSlitWithElectronsSchema } from './schema';
import { initialState, type DoubleSlitWithElectronsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const doubleSlitWithElectronsBundle: Bundle<DoubleSlitWithElectronsState> = {
  schema: doubleSlitWithElectronsSchema,
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
