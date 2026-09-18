// ========================================================================
// @aperi21/sim-ballistic-pendulum
// ========================================================================
// 탄동 진자 — 박히는 동안 이어지는 것은 운동량이고, 올라가는 동안 이어지는 것은
// 에너지다. 화면에서는 막대 둘이 번갈아 그 일을 한다: 박히는 동안 에너지 막대만
// 무너지고, 오르는 동안 운동량 막대만 줄어든다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { ballisticPendulumSchema } from './schema';
import { initialState, type BallisticPendulumState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const ballisticPendulumBundle: Bundle<BallisticPendulumState> = {
  schema: ballisticPendulumSchema,
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
