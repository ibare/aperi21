// ========================================================================
// @aperi21/sim-constructive-destructive
// ========================================================================
// 보강과 상쇄 — 위상차 하나가 두 파동의 합의 크기를 정한다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { constructiveDestructiveSchema } from './schema';
import { initialState, type ConstructiveDestructiveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const constructiveDestructiveBundle: Bundle<ConstructiveDestructiveState> = {
  schema: constructiveDestructiveSchema,
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
