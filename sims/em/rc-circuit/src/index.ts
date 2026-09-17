// ========================================================================
// @aperi21/sim-rc-circuit
// ========================================================================
// 극판에 쌓인 전하가 흐름을 막아, 가려는 전압까지 남은 차이가 τ 마다 같은 비율로 줄어든다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/rc-circuit).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rcCircuitSchema } from './schema';
import { initialState, type RcCircuitState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rcCircuitBundle: Bundle<RcCircuitState> = {
  schema: rcCircuitSchema,
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
