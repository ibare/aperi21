// ========================================================================
// @aperi21/sim-newtons-rings
// ========================================================================
// 볼록 렌즈와 평판 사이 공기층은 가운데서 멀어질수록 가파르게 두꺼워져, 어두운 고리가
// 바깥으로 갈수록 촘촘해진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다 (NOTES.md).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { newtonsRingsSchema } from './schema';
import { initialState, type NewtonsRingsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const newtonsRingsBundle: Bundle<NewtonsRingsState> = {
  schema: newtonsRingsSchema,
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
