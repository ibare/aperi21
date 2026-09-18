// ========================================================================
// @aperi21/sim-rolling-race
// ========================================================================
// 같은 비탈 같은 높이에서 놓은 고리 · 원판 둘 · 공이 질량 · 반지름과 무관하게
// 모양(질량 분포)만으로 도착 순서가 갈린다 — 공, 원판 둘(함께), 고리.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rollingRaceSchema } from './schema';
import { initialState, type RollingRaceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rollingRaceBundle: Bundle<RollingRaceState> = {
  schema: rollingRaceSchema,
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
