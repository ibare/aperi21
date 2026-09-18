// ========================================================================
// @aperi21/sim-rotational-kinetic-energy
// ========================================================================
// 같은 속력으로 달려도 구르는 쪽은 회전 몫 ½Iω² 을 더 담고 있다 — 같은 고리 둘이
// 같은 속력으로 같은 비탈에 들어가, 구르는 고리가 미끄러지는 고리의 두 배 높이 오른다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { rotationalKineticEnergySchema } from './schema';
import { initialState, type RotationalKineticEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const rotationalKineticEnergyBundle: Bundle<RotationalKineticEnergyState> = {
  schema: rotationalKineticEnergySchema,
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
