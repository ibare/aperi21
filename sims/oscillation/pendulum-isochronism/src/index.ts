// ========================================================================
// @aperi21/sim-pendulum-isochronism
// ========================================================================
// 길이가 같고 진폭만 다른 진자 다섯이 저마다 다른 거리를 다른 속도로 지나면서도
// 같은 순간 바닥에서 다시 모인다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/pendulum-isochronism).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { pendulumIsochronismSchema } from './schema';
import { initialState, type PendulumIsochronismState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const pendulumIsochronismBundle: Bundle<PendulumIsochronismState> = {
  schema: pendulumIsochronismSchema,
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
