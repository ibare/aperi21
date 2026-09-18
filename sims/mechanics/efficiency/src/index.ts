// ========================================================================
// @aperi21/sim-efficiency
// ========================================================================
// 효율은 내놓은 양이 아니라 넣은 것에 대한 몫이다 — 더 많이 내놓는 기계 A 보다,
// 입구를 같은 굵기로 맞추면 기계 B 의 쓸모 갈래가 더 굵다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { efficiencySchema } from './schema';
import { initialState, type EfficiencyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const efficiencyBundle: Bundle<EfficiencyState> = {
  schema: efficiencySchema,
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
