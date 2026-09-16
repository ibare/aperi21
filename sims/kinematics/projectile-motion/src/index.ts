import type { Bundle } from '@aperi21/schema';

import { projectileMotionSchema } from './schema';
import { initialState, type ProjectileMotionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const projectileMotionBundle: Bundle<ProjectileMotionState> = {
  schema: projectileMotionSchema,
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
