import type { Bundle } from '@aperi21/schema';

import { velocityTimeGraphSchema } from './schema';
import { initialState, type VelocityTimeGraphState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const velocityTimeGraphBundle: Bundle<VelocityTimeGraphState> = {
  schema: velocityTimeGraphSchema,
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
