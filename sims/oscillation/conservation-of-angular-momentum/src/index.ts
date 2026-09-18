// ========================================================================
// @aperi21/sim-conservation-of-angular-momentum
// ========================================================================
// 각운동량 보존 — 질량을 축 가까이 모으면 Iω 가 그대로인 채 빨라진다.
// 화면에서는 같은 시간 동안 쓸고 가는 부채꼴이 넓어지고, 가로 I · 세로 ω
// 직사각형의 모서리가 「Iω 그대로」 곡선을 타고 올라간다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { conservationOfAngularMomentumSchema } from './schema';
import { initialState, type ConservationOfAngularMomentumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const conservationOfAngularMomentumBundle: Bundle<ConservationOfAngularMomentumState> = {
  schema: conservationOfAngularMomentumSchema,
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
