// ========================================================================
// @aperi21/sim-resonance
// ========================================================================
// 같은 흔들림을 받는 진동자 묶음에서 고유 진동수가 구동과 맞는 것에만 흔들림이 쌓인다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/resonance). 자유 렌더 없이
// 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { resonanceSchema } from './schema';
import { initialState, type ResonanceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const resonanceBundle: Bundle<ResonanceState> = {
  schema: resonanceSchema,
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
