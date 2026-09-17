// ========================================================================
// @aperi21/sim-standing-wave
// ========================================================================
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/standing-wave).
// 자유 렌더 없이 선언만으로 옮겼고, 시간 자취 무늬는 scalarField 하나로 그린다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { standingWaveSchema } from './schema';
import { initialState, type StandingWaveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const standingWaveBundle: Bundle<StandingWaveState> = {
  schema: standingWaveSchema,
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
