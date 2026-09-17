// ========================================================================
// @aperi21/sim-hydrogen-spectrum
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/hydrogen-spectrum).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { hydrogenSpectrumSchema } from './schema';
import { initialState, type HydrogenSpectrumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const hydrogenSpectrumBundle: Bundle<HydrogenSpectrumState> = {
  schema: hydrogenSpectrumSchema,
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
