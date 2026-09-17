// ========================================================================
// @aperi21/sim-poiseuille-flow
// ========================================================================
// 관을 두 배 굵게 하면 왜 열여섯 배가 흐르는가 — 가운데가 네 배 빠르고 단면이
// 네 배 넓다. 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/poiseuille-flow).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { poiseuilleFlowSchema } from './schema';
import { initialState, type PoiseuilleFlowState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const poiseuilleFlowBundle: Bundle<PoiseuilleFlowState> = {
  schema: poiseuilleFlowSchema,
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
