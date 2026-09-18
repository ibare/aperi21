// ========================================================================
// @aperi21/sim-quality-factor
// ========================================================================
// 같은 Q 의 두 얼굴 — 공명 봉우리가 뾰족한 진동자일수록 구동을 멈춘 뒤 오래
// 울린다. Q = 3 과 Q = 12 를 나란히 훑고, 맞추고, 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { qualityFactorSchema } from './schema';
import { initialState, type QualityFactorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const qualityFactorBundle: Bundle<QualityFactorState> = {
  schema: qualityFactorSchema,
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
