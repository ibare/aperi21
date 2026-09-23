// ========================================================================
// @aperi21/sim-newtons-first-law
// ========================================================================
// 급정거한 버스에서 승객을 민 것은 없다 — 버스만 느려지고 승객은 원래 속도로
// 그대로 간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/newtons-first-law).
// 어휘(`trace` · 시간표 · 캡션 슬롯)가 생기면서 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { newtonsFirstLawSchema } from './schema';
import { initialState, type NewtonsFirstLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const newtonsFirstLawBundle: Bundle<NewtonsFirstLawState> = {
  schema: newtonsFirstLawSchema,
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
