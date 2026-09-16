import type { Bundle } from '@aperi21/schema';

import { stoppingDistanceSchema } from './schema';
import { initialState, type StoppingDistanceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const stoppingDistanceBundle: Bundle<StoppingDistanceState> = {
  schema: stoppingDistanceSchema,
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
