// ========================================================================
// @aperi21/sim-lenz-law
// ========================================================================
// 코일 전류는 자석이 한가운데를 지날 때 방향을 뒤집지만, 자석이 받는 힘은
// 뒤집히지 않는다 — 다가오면 되밀고 멀어지면 붙잡아, 언제나 움직임을 거스른다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/lenz-law).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lenzLawSchema } from './schema';
import { initialState, type LenzLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lenzLawBundle: Bundle<LenzLawState> = {
  schema: lenzLawSchema,
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
