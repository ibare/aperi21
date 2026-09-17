// ========================================================================
// @aperi21/sim-field-lines
// ========================================================================
// 전기력선이 촘촘한 곳이 장이 센 곳이다 — 장에 떠밀리는 알갱이가 선이 몰린 곳에서
// 빨라지고 선이 성긴 곳에서 느려진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/field-lines).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { fieldLinesSchema } from './schema';
import { initialState, type FieldLinesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const fieldLinesBundle: Bundle<FieldLinesState> = {
  schema: fieldLinesSchema,
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
