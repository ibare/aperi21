import type { Bundle } from '@aperi21/schema';

import { centripetalAccelerationSchema } from './schema';
import { initialState, type CentripetalAccelerationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const centripetalAccelerationBundle: Bundle<CentripetalAccelerationState> = {
  schema: centripetalAccelerationSchema,
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
