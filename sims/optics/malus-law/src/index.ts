// ========================================================================
// @aperi21/sim-malus-law
// ========================================================================
// 편광된 진동을 검광판 축에 투영한 성분(cos)과 지난 세기(cos²)를 나란히 보인다 —
// 판이 0 · 30 · 45 · 60 · 90° 로 돌 때마다 세기 막대가 성분 점선 아래로 벌어져 선다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { malusLawSchema } from './schema';
import { initialState, type MalusLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const malusLawBundle: Bundle<MalusLawState> = {
  schema: malusLawSchema,
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
