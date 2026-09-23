// ========================================================================
// @aperi21/sim-field-of-straight-wire
// ========================================================================
// 전선에 전류를 흘리면 둘레의 나침반들이 전선을 감아 도는 고리 쪽으로 돌아서고,
// 전선에서 멀수록 덜 돌아선다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/field-of-straight-wire).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { fieldOfStraightWireSchema } from './schema';
import { initialState, type FieldOfStraightWireState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const fieldOfStraightWireBundle: Bundle<FieldOfStraightWireState> = {
  schema: fieldOfStraightWireSchema,
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
