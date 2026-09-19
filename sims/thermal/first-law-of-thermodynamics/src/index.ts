// ========================================================================
// @aperi21/sim-first-law-of-thermodynamics
// ========================================================================
// 넣은 열은 기체를 데우는 몫과 피스톤을 미는 몫으로 갈린다. 피스톤을 고정하면 모두 기체에 남는다.
// 자유 구현 원본 없이 표준 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { firstLawOfThermodynamicsSchema } from './schema';
import { initialState, type FirstLawOfThermodynamicsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const firstLawOfThermodynamicsBundle: Bundle<FirstLawOfThermodynamicsState> = {
  schema: firstLawOfThermodynamicsSchema,
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
