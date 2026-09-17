// ========================================================================
// @aperi21/sim-connected-bodies
// ========================================================================
// 같은 힘으로 같은 전체 질량을 끌면, 끈으로 어떻게 나눠 이어도 한 덩어리와 똑같이 가속한다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/connected-bodies).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { connectedBodiesSchema } from './schema';
import { initialState, type ConnectedBodiesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const connectedBodiesBundle: Bundle<ConnectedBodiesState> = {
  schema: connectedBodiesSchema,
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
