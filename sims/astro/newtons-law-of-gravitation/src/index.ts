// ========================================================================
// @aperi21/sim-newtons-law-of-gravitation
// ========================================================================
// 두 물체가 서로 같은 크기로 당기는 한 쌍의 힘은 거리가 n 배가 되면 함께 1/n² 로
// 줄어든다 — 거리를 2배 · 3배로 벌리며 두 화살표가 점선 잔상의 1/4 · 1/9 로 준다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { newtonsLawOfGravitationSchema } from './schema';
import { initialState, type NewtonsLawOfGravitationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const newtonsLawOfGravitationBundle: Bundle<NewtonsLawOfGravitationState> = {
  schema: newtonsLawOfGravitationSchema,
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
