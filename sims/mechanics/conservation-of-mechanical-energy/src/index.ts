// ========================================================================
// @aperi21/sim-conservation-of-mechanical-energy
// ========================================================================
// 위치에 담긴 것과 운동에 담긴 것이 서로 자리를 바꾸는 동안 둘의 합은 변하지 않는다.
//
// 매끄러운 골짜기를 왕복하는 공 옆에, 공을 따라다니는 기둥이 기준면에서 놓은 높이
// 수평선까지 늘 닿아 있다. 공이 그 기둥을 두 몫으로 가르고, 가르는 자리만 오르내린다.
//
// 엔진 위에서 바로 만든 조각이다 — 자유 구현 원본이 없다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { conservationOfMechanicalEnergySchema } from './schema';
import { initialState, type ConservationOfMechanicalEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const conservationOfMechanicalEnergyBundle: Bundle<ConservationOfMechanicalEnergyState> = {
  schema: conservationOfMechanicalEnergySchema,
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
