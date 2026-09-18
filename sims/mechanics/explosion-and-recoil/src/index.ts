// ========================================================================
// @aperi21/sim-explosion-and-recoil
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { explosionAndRecoilSchema } from './schema';
import { initialState, type ExplosionAndRecoilState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const explosionAndRecoilBundle: Bundle<ExplosionAndRecoilState> = {
  schema: explosionAndRecoilSchema,
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
