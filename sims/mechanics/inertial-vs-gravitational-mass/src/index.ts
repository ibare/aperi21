// ========================================================================
// @aperi21/sim-inertial-vs-gravitational-mass
// ========================================================================
// 끌리는 세기로 재는 저울과 밀리기 어려움으로 재는 얼음 위 밀어내기는, 추를 하나씩 늘려
// 가면 같은 개수에서 함께 균형을 이룬다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/inertial-vs-gravitational-mass).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { inertialVsGravitationalMassSchema } from './schema';
import { initialState, type InertialVsGravitationalMassState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const inertialVsGravitationalMassBundle: Bundle<InertialVsGravitationalMassState> = {
  schema: inertialVsGravitationalMassSchema,
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
