// ========================================================================
// @aperi21/sim-insulation
// ========================================================================
// 같은 뜨거운 물을 다른 감쌈에 두면 같은 시간 뒤 식은 정도가 다르다 — 맨 컵 · 천 감쌈 ·
// 스티로폼 컵의 온도 막대가 서로 다른 빠르기로 내려가고 곡선 셋이 벌어진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { insulationSchema } from './schema';
import { initialState, type InsulationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const insulationBundle: Bundle<InsulationState> = {
  schema: insulationSchema,
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
