// ========================================================================
// @aperi21/sim-latent-heat
// ========================================================================
// 같은 세기로 계속 데우는데 얼음이 녹는 동안과 물이 끓는 동안 온도가 평평하게
// 멈춘다 — 그릇에서 얼음 → 물 → 김으로 몫이 옮겨 가는 동안 시간-온도 곡선이 눕는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { latentHeatSchema } from './schema';
import { initialState, type LatentHeatState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const latentHeatBundle: Bundle<LatentHeatState> = {
  schema: latentHeatSchema,
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
