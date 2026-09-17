// ========================================================================
// @aperi21/sim-pulley-system
// ========================================================================
// 짐을 받치는 줄 가닥이 많을수록 손은 더 약한 힘으로 가닥 수 배만큼 더 긴 줄을 당긴다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/pulley-system).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { pulleySystemSchema } from './schema';
import { initialState, type PulleySystemState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const pulleySystemBundle: Bundle<PulleySystemState> = {
  schema: pulleySystemSchema,
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
