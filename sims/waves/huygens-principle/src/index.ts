// ========================================================================
// @aperi21/sim-huygens-principle
// ========================================================================
// 파면 위 점마다 나간 동그란 파가 촘촘히 겹치면 곧은 파면이 되어 나아간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/huygens-principle).
// 자유 렌더 없이 선언만으로 옮겼다 — 물결 변위는 scalarField 두 장 (NOTES.md).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { huygensPrincipleSchema } from './schema';
import { initialState, type HuygensPrincipleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const huygensPrincipleBundle: Bundle<HuygensPrincipleState> = {
  schema: huygensPrincipleSchema,
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
