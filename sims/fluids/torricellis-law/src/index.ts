// ========================================================================
// @aperi21/sim-torricellis-law
// ========================================================================
// 구멍이 깊을수록 왜 더 세게 뿜는가 — 구멍 위 물기둥이 깊을수록 물이 더 빠른
// 속도로 뿜어 나간다. v = √(2gh).
//
// 원본은 엔진 없이 손으로 짠 430줄이었다 (tasks/piece-lab/torricellis-law).
// 어휘가 생기면서 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { torricellisLawSchema } from './schema';
import { initialState, type TorricellisLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const torricellisLawBundle: Bundle<TorricellisLawState> = {
  schema: torricellisLawSchema,
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
