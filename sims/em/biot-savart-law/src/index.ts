// ========================================================================
// @aperi21/sim-biot-savart-law
// ========================================================================
// 고리를 조각으로 나눠 조각마다 축 위 P 에 만드는 작은 장 dB 를 머리-꼬리로 잇는다.
// 위 · 아래로 기운 몫이 지워지고 합 B 는 축을 따라 선다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { biotSavartLawSchema } from './schema';
import { initialState, type BiotSavartLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const biotSavartLawBundle: Bundle<BiotSavartLawState> = {
  schema: biotSavartLawSchema,
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
