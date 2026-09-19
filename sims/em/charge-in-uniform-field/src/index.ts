// ========================================================================
// @aperi21/sim-charge-in-uniform-field
// ========================================================================
// 균일한 전기장 속으로 옆에서 들어온 전하가 던진 공처럼 포물선을 그린다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { chargeInUniformFieldSchema } from './schema';
import { initialState, type ChargeInUniformFieldState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const chargeInUniformFieldBundle: Bundle<ChargeInUniformFieldState> = {
  schema: chargeInUniformFieldSchema,
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
