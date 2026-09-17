// ========================================================================
// @aperi21/sim-kinetic-friction
// ========================================================================
// 미끄러지는 동안의 마찰은 빠르기와 상관없이 같은 크기라서, 빠른 상자와 느린
// 상자가 같은 만큼씩 느려진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/kinetic-friction).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { kineticFrictionSchema } from './schema';
import { initialState, type KineticFrictionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const kineticFrictionBundle: Bundle<KineticFrictionState> = {
  schema: kineticFrictionSchema,
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
