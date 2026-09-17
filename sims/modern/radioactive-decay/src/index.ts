// ========================================================================
// @aperi21/sim-radioactive-decay
// ========================================================================
// 반감기가 지나 절반이 붕괴해도 남은 것이 다시 절반이 된다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/radioactive-decay).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { radioactiveDecaySchema } from './schema';
import { initialState, type RadioactiveDecayState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const radioactiveDecayBundle: Bundle<RadioactiveDecayState> = {
  schema: radioactiveDecaySchema,
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
