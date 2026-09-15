import type { Bundle } from '@aperi21/schema';
import { controllers } from './controllers';
import { boundsHint, initialState, step } from './physics';
import { scene } from './scene';
import { schema } from './schema';
import type { DcCircuitState } from './state';

export { schema, scene, controllers };
export type { DcCircuitState };

export const dcCircuitBundle: Bundle<DcCircuitState> = {
  schema,
  initialState,
  step,
  scene,
  controllers,
  boundsHint,
};

export default dcCircuitBundle;
