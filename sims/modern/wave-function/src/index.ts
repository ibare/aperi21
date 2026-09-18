// ========================================================================
// @aperi21/sim-wave-function
// ========================================================================
// 파동 함수 — 부호 있는 ψ 와 그 제곱 |ψ|², 측정을 거듭해 쌓인 점이 |ψ|² 를 따른다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다. 자유 렌더 0건.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { waveFunctionSchema } from './schema';
import { initialState, type WaveFunctionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const waveFunctionBundle: Bundle<WaveFunctionState> = {
  schema: waveFunctionSchema,
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
