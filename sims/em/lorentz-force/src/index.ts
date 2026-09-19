// ========================================================================
// @aperi21/sim-lorentz-force
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lorentzForceSchema } from './schema';
import { initialState, type LorentzForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lorentzForceBundle: Bundle<LorentzForceState> = {
  schema: lorentzForceSchema,
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
