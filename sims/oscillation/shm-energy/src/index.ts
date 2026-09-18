// ========================================================================
// @aperi21/sim-shm-energy
// ========================================================================
// 용수철에 매단 상자가 진동하는 동안 운동 에너지와 탄성 퍼텐셜이 서로를 채우고
// 합은 그대로다 — 높이가 정해진 막대 하나의 경계가 한 주기에 두 번 오르내린다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { shmEnergySchema } from './schema';
import { initialState, type ShmEnergyState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const shmEnergyBundle: Bundle<ShmEnergyState> = {
  schema: shmEnergySchema,
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
