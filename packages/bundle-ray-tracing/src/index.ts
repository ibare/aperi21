import type { Bundle } from '@aperi21/schema';
import { controllers } from './controllers';
import { boundsHint, derivedValues, initialState, step } from './physics';
import { scene } from './scene';
import { schema } from './schema';
import type { RayTracingState } from './state';

export { schema, scene, controllers };
export type { RayTracingState };

export const rayTracingBundle: Bundle<RayTracingState> = {
  schema,
  initialState,
  step,
  scene,
  controllers,
  derivedValues,
  boundsHint,
};

export default rayTracingBundle;
