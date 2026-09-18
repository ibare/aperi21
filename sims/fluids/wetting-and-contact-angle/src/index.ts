// ========================================================================
// @aperi21/sim-wetting-and-contact-angle
// ========================================================================
// 같은 물방울이 깨끗한 유리에서는 얇게 퍼지고 왁스 위에서는 둥글게 뭉친다 — 가장자리에서
// 세 장력이 가로로 맞서는 각이 접촉각이다. 표면이 바뀌면 줄다리기가 기울어 가장자리가
// 밀려 들어오거나 나가고, 다시 맞서는 각에서 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { wettingAndContactAngleSchema } from './schema';
import { initialState, type WettingAndContactAngleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const wettingAndContactAngleBundle: Bundle<WettingAndContactAngleState> = {
  schema: wettingAndContactAngleSchema,
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
