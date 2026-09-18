// ========================================================================
// @aperi21/sim-floating-and-draft
// ========================================================================
// 뜬 물체는 제 무게만큼의 물을 밀어낼 때까지 잠긴다 — 같은 크기라면 무거운 것이 깊이,
// 진한 물에서는 덜 잠긴다. 잠기는 몫은 물체 밀도 ÷ 물 밀도다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { floatingAndDraftSchema } from './schema';
import { initialState, type FloatingAndDraftState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const floatingAndDraftBundle: Bundle<FloatingAndDraftState> = {
  schema: floatingAndDraftSchema,
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
