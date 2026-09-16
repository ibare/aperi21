import type { Bundle } from '@aperi21/schema';

import { angularAccelerationSchema } from './schema';
import { initialState, type AngularAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const angularAccelerationBundle: Bundle<AngularAccelerationState> = {
  schema: angularAccelerationSchema,
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
