// ========================================================================
// @aperi21/sim-lift-force
// ========================================================================
// 같은 순간 한 줄로 뿌린 연기가 날개 앞에서 갈라져 위쪽 절반이 아래쪽을 앞질러 간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/lift-force).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { liftForceSchema } from './schema';
import { initialState, type LiftForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const liftForceBundle: Bundle<LiftForceState> = {
  schema: liftForceSchema,
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
