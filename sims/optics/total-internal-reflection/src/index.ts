// ========================================================================
// @aperi21/sim-total-internal-reflection
// ========================================================================
// 임계각에 다가가면 나가는 빛이 경계면에 누우며 흐려지다 사라지고, 되돌아오는 빛이 그만큼 밝아진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/total-internal-reflection).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { totalInternalReflectionSchema } from './schema';
import { initialState, type TotalInternalReflectionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const totalInternalReflectionBundle: Bundle<TotalInternalReflectionState> = {
  schema: totalInternalReflectionSchema,
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
