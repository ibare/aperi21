// ========================================================================
// @aperi21/sim-normal-modes
// ========================================================================
// 당겼다 놓은 사슬의 뒤섞인 흔들림은, 몇 가지 고정된 모양이 제 모양 그대로 저마다
// 다른 박자로 부풀고 줄어드는 것을 더한 것이다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/normal-modes). 자유 렌더 없이
// 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { normalModesSchema } from './schema';
import { initialState, type NormalModesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const normalModesBundle: Bundle<NormalModesState> = {
  schema: normalModesSchema,
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
