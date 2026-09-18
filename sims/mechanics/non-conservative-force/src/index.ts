// ========================================================================
// @aperi21/sim-non-conservative-force
// ========================================================================
// 같은 A 에서 같은 B 로 옮겨도, B 를 지나쳤다 돌아온 상자가 곧장 간 상자의 두 배를
// 마찰로 잃는다 — 마찰이 빼앗는 에너지는 변위가 아니라 지나온 길을 따라간다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { nonConservativeForceSchema } from './schema';
import { initialState, type NonConservativeForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const nonConservativeForceBundle: Bundle<NonConservativeForceState> = {
  schema: nonConservativeForceSchema,
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
