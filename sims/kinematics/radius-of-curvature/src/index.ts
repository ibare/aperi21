import type { Bundle } from '@aperi21/schema';

import { radiusOfCurvatureSchema } from './schema';
import { initialState, type RadiusOfCurvatureState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const radiusOfCurvatureBundle: Bundle<RadiusOfCurvatureState> = {
  schema: radiusOfCurvatureSchema,
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
