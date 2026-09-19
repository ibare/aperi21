// ========================================================================
// @aperi21/sim-potential-divider
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { potentialDividerSchema } from './schema';
import { initialState, type PotentialDividerState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const potentialDividerBundle: Bundle<PotentialDividerState> = {
  schema: potentialDividerSchema,
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
