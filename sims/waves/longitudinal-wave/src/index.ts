// ========================================================================
// @aperi21/sim-longitudinal-wave
// ========================================================================
// 입자는 제자리에서 앞뒤로만 흔들리고, 앞으로 나아가는 것은 빽빽하게 몰린 자리다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/longitudinal-wave).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { longitudinalWaveSchema } from './schema';
import { initialState, type LongitudinalWaveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const longitudinalWaveBundle: Bundle<LongitudinalWaveState> = {
  schema: longitudinalWaveSchema,
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
