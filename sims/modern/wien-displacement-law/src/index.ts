// ========================================================================
// @aperi21/sim-wien-displacement-law
// ========================================================================
// 빈 변위 법칙 — 온도가 두 배면 봉우리 파장은 절반이다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { wienDisplacementLawSchema } from './schema';
import { initialState, type WienDisplacementLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const wienDisplacementLawBundle: Bundle<WienDisplacementLawState> = {
  schema: wienDisplacementLawSchema,
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
