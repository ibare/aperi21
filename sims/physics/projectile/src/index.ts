import type { Bundle } from '@aperi21/schema';
import { controllers } from './controllers';
import { boundsHint, initialState, isTerminated, step } from './physics';
import { scene } from './scene';
import { schema } from './schema';
import type { ProjectileState } from './state';

export { schema, controllers, scene };
export type { ProjectileState };

export const projectileBundle: Bundle<ProjectileState> = {
  schema,
  initialState,
  step,
  scene,
  controllers,
  isTerminated,
  boundsHint,
};

export default projectileBundle;
