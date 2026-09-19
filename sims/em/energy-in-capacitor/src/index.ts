// ========================================================================
// @aperi21/sim-energy-in-capacitor
// ========================================================================
// 축전기에 쌓인 에너지는 왜 QV 가 아니라 절반인가 — 전하를 한 몫씩 옮길 때마다
// 판 전압이 올라 다음 몫이 더 든다. 몫마다의 일 띠가 V–Q 직선 아래 삼각형을 채운다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { energyInCapacitorSchema } from './schema';
import { initialState, type EnergyInCapacitorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const energyInCapacitorBundle: Bundle<EnergyInCapacitorState> = {
  schema: energyInCapacitorSchema,
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
