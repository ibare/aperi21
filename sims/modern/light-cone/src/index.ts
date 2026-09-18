// ========================================================================
// @aperi21/sim-light-cone
// ========================================================================
// 사건 E 에서 퍼지는 빛이 시공간에 원뿔을 쓸고, 그 안쪽 사건에만 E 의 신호가 닿는다.
// 움직이는 관찰자의 틀로 바꿔도 사건은 미끄러질 뿐 원뿔은 그대로다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lightConeSchema } from './schema';
import { initialState, type LightConeState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lightConeBundle: Bundle<LightConeState> = {
  schema: lightConeSchema,
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
