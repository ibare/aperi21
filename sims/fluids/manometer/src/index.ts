// ========================================================================
// @aperi21/sim-manometer
// ========================================================================
// 같은 압력 차가 U자관 두 액면의 높이 차로 나타난다 — 한 기체 통에 이은 물 관과
// 수은 관에서 가벼운 물은 크게, 무거운 수은은 겨우 벌어진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { manometerSchema } from './schema';
import { initialState, type ManometerState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const manometerBundle: Bundle<ManometerState> = {
  schema: manometerSchema,
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
