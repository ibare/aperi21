// ========================================================================
// @aperi21/sim-carnot-cycle
// ========================================================================
// 받은 열 가운데 차가운 쪽 온도 아래 깔린 몫은 한 바퀴마다 빠져나가고, 그 위만 일로 남는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/carnot-cycle).
// 자유 렌더 없이 표준 어휘로 선언한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { carnotCycleSchema } from './schema';
import { initialState, type CarnotCycleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const carnotCycleBundle: Bundle<CarnotCycleState> = {
  schema: carnotCycleSchema,
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
