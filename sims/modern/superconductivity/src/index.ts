// ========================================================================
// @aperi21/sim-superconductivity
// ========================================================================
// 두 금속을 함께 식힌다. 구리의 저항은 매끄럽게 줄다 바닥(잔류 저항)에 남고,
// 수은의 저항은 임계 온도 4.2 K 에서 수직으로 떨어져 0 이 된다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { superconductivitySchema } from './schema';
import { initialState, type SuperconductivityState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const superconductivityBundle: Bundle<SuperconductivityState> = {
  schema: superconductivitySchema,
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
