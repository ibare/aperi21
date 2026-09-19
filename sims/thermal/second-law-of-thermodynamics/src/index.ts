// ========================================================================
// @aperi21/sim-second-law-of-thermodynamics
// ========================================================================
// 칸막이를 걷으면 왼쪽에만 있던 분자가 양쪽에 고르게 퍼지고, 다시 모이지 않는다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { secondLawOfThermodynamicsSchema } from './schema';
import { initialState, type SecondLawOfThermodynamicsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const secondLawOfThermodynamicsBundle: Bundle<SecondLawOfThermodynamicsState> = {
  schema: secondLawOfThermodynamicsSchema,
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
