// ========================================================================
// @aperi21/sim-simple-pendulum
// ========================================================================
// 단진자 — 작은 진폭에서 주기는 줄 길이만 따른다. 같은 보에 매단 세 진자 중
// 줄이 같고 질량이 네 배 다른 두 추는 나란히 같은 박자로 흔들리고, 줄이 네 배 긴
// 추는 그 둘이 두 번 다녀올 때 한 번 다녀온다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { simplePendulumSchema } from './schema';
import { initialState, type SimplePendulumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const simplePendulumBundle: Bundle<SimplePendulumState> = {
  schema: simplePendulumSchema,
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
