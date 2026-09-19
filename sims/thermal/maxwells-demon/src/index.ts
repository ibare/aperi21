// ========================================================================
// @aperi21/sim-maxwells-demon
// ========================================================================
// 문 앞 도깨비가 빠른 알갱이는 오른쪽, 느린 알갱이는 왼쪽으로만 보내 두 칸의 온도가
// 갈라지고, 그동안 잰 알갱이마다 공책에 한 줄씩 적힌다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { maxwellsDemonSchema } from './schema';
import { initialState, type MaxwellsDemonState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const maxwellsDemonBundle: Bundle<MaxwellsDemonState> = {
  schema: maxwellsDemonSchema,
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
