// ========================================================================
// @aperi21/sim-refraction-of-waves
// ========================================================================
// 경계를 비스듬히 지나는 마루는 먼저 느린 쪽에 들어간 끝부터 뒤처져 꺾인다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/refraction-of-waves).
// 자유 렌더 없이 선언만으로 옮겼다 — 물결 장은 scalarField 한 장 (NOTES.md).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { refractionOfWavesSchema } from './schema';
import { initialState, type RefractionOfWavesState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const refractionOfWavesBundle: Bundle<RefractionOfWavesState> = {
  schema: refractionOfWavesSchema,
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
