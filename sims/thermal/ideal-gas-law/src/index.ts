// ========================================================================
// @aperi21/sim-ideal-gas-law
// ========================================================================
// 셋 중 하나에 자물쇠를 걸고 하나를 바꾸면 남은 하나가 정해진 배수로 따라간다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { idealGasLawSchema } from './schema';
import { initialState, type IdealGasLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const idealGasLawBundle: Bundle<IdealGasLawState> = {
  schema: idealGasLawSchema,
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
