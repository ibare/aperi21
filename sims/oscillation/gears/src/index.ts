// ========================================================================
// @aperi21/sim-gears
// ========================================================================
// 기어 — 맞물린 두 기어는 톱니가 같은 수만큼 지나가므로, 톱니가 많은 쪽이 느리게
// 돌고 대신 돌림힘이 크다. 화면에서는 지난 톱니가 두 기어에서 같은 개수만큼 차오르고
// (작은 기어는 한 바퀴를 채우는데 큰 기어는 일부만), 접점의 같은 힘 F 가 k 배 긴 팔에
// 걸려 돌림힘 화살표가 k 배 크게 쓸린다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { gearsSchema } from './schema';
import { initialState, type GearsState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const gearsBundle: Bundle<GearsState> = {
  schema: gearsSchema,
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
