// ========================================================================
// @aperi21/sim-youngs-modulus
// ========================================================================
// 같은 추를 걸면 강철선의 눈금은 선의 길이와 상관없이 같은 높이까지 내려오고,
// 알루미늄선의 눈금은 더 내려온다 — 늘어나는 정도는 재료가 정한다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/youngs-modulus).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { youngsModulusSchema } from './schema';
import { initialState, type YoungsModulusState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const youngsModulusBundle: Bundle<YoungsModulusState> = {
  schema: youngsModulusSchema,
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
