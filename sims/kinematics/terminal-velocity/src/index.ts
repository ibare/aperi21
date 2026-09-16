import type { Bundle } from '@aperi21/schema';

import { terminalVelocitySchema } from './schema';
import { initialState, type TerminalVelocityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const terminalVelocityBundle: Bundle<TerminalVelocityState> = {
  schema: terminalVelocitySchema,
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
