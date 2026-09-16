import type { Bundle } from '@aperi21/schema';

import { relativeVelocitySchema } from './schema';
import { initialState, type RelativeVelocityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const relativeVelocityBundle: Bundle<RelativeVelocityState> = {
  schema: relativeVelocitySchema,
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
