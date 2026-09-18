// ========================================================================
// @aperi21/sim-elastic-collision
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { elasticCollisionSchema } from './schema';
import { initialState, type ElasticCollisionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const elasticCollisionBundle: Bundle<ElasticCollisionState> = {
  schema: elasticCollisionSchema,
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
