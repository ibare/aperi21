// ========================================================================
// @aperi21/sim-binding-energy-curve
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bindingEnergyCurveSchema } from './schema';
import { initialState, type BindingEnergyCurveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bindingEnergyCurveBundle: Bundle<BindingEnergyCurveState> = {
  schema: bindingEnergyCurveSchema,
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
