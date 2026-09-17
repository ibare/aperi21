// ========================================================================
// @aperi21/sim-tension
// ========================================================================
// 줄 한 가닥 어디에 저울을 끼워도, 도르래를 돌아 꺾인 뒤에도 모든 저울이 손이
// 당기는 힘만큼 함께 늘어난다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/tension).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { tensionSchema } from './schema';
import { initialState, type TensionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const tensionBundle: Bundle<TensionState> = {
  schema: tensionSchema,
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
