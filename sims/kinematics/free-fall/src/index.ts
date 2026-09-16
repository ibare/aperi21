import type { Bundle } from '@aperi21/schema';

import { freeFallSchema } from './schema';
import { initialState, type FreeFallState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const freeFallBundle: Bundle<FreeFallState> = {
  schema: freeFallSchema,
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
