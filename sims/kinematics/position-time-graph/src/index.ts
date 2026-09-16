import type { Bundle } from '@aperi21/schema';

import { positionTimeGraphSchema } from './schema';
import { initialState, type PositionTimeGraphState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const positionTimeGraphBundle: Bundle<PositionTimeGraphState> = {
  schema: positionTimeGraphSchema,
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
