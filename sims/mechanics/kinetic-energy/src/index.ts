// ========================================================================
// @aperi21/sim-kinetic-energy
// ========================================================================
// 속력이 두 배면 왜 에너지도 두 배가 아니라 네 배인가 — 같은 마찰에 맞서
// 두 배 빠른 상자가 네 배 멀리 미끄러진다. 마찰이 빼앗은 에너지 = 힘 × 거리.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { kineticEnergySchema } from './schema';
import { initialState, type KineticEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const kineticEnergyBundle: Bundle<KineticEnergyState> = {
  schema: kineticEnergySchema,
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
