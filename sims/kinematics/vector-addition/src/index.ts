import type { Bundle } from '@aperi21/schema';

import { vectorAdditionSchema } from './schema';
import { initialState, type VectorAdditionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const vectorAdditionBundle: Bundle<VectorAdditionState> = {
  schema: vectorAdditionSchema,
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
