// ========================================================================
// @aperi21/sim-converging-diverging-lens
// ========================================================================
// 나란히 들어온 빛을 볼록 렌즈는 렌즈 뒤 한 점(실초점)으로 모으고, 오목 렌즈는
// 렌즈 앞 한 점(허초점)에서 나온 것처럼 퍼뜨린다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { convergingDivergingLensSchema } from './schema';
import { initialState, type ConvergingDivergingLensState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const convergingDivergingLensBundle: Bundle<ConvergingDivergingLensState> = {
  schema: convergingDivergingLensSchema,
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
