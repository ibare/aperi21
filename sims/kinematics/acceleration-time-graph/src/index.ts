// ========================================================================
// @aperi21/sim-acceleration-time-graph
// ========================================================================
// 가속도-시간 그래프 아래 넓이는 한 칸씩 떼어 쌓으면 그 높이가 곧 속도 변화다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/acceleration-time-graph).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { accelerationTimeGraphSchema } from './schema';
import { initialState, type AccelerationTimeGraphState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const accelerationTimeGraphBundle: Bundle<AccelerationTimeGraphState> = {
  schema: accelerationTimeGraphSchema,
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
