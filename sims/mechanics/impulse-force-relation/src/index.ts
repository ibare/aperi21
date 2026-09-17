// ========================================================================
// @aperi21/sim-impulse-force-relation
// ========================================================================
// 같은 공을 똑같이 멈춰 세워도, 오래 걸려 멈추게 하면 공이 받는 힘이 낮아진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/impulse-force-relation).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { impulseForceRelationSchema } from './schema';
import { initialState, type ImpulseForceRelationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const impulseForceRelationBundle: Bundle<ImpulseForceRelationState> = {
  schema: impulseForceRelationSchema,
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
