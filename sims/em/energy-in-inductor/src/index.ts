// ========================================================================
// @aperi21/sim-energy-in-inductor
// ========================================================================
// 전류를 키우는 동안 역기전력을 거슬러 한 일이 자기장에 쌓인다 — 자기력선이 늘고
// LI–I 직선 아래 삼각형이 차오른다. 전류를 줄이면 그 에너지가 돌아 나온다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { energyInInductorSchema } from './schema';
import { initialState, type EnergyInInductorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const energyInInductorBundle: Bundle<EnergyInInductorState> = {
  schema: energyInInductorSchema,
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
