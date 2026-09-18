// ========================================================================
// @aperi21/sim-work-energy-theorem
// ========================================================================
// 힘과 거리를 달리 나눠도 한 일이 같으면 붙는 속력이 같다 — 같은 수레 둘을
// 2F × d 와 F × 2d 로 밀면, 밀기가 끝났을 때 두 수레의 속력이 같다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { workEnergyTheoremSchema } from './schema';
import { initialState, type WorkEnergyTheoremState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const workEnergyTheoremBundle: Bundle<WorkEnergyTheoremState> = {
  schema: workEnergyTheoremSchema,
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
