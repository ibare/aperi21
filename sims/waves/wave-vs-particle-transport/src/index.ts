// ========================================================================
// @aperi21/sim-wave-vs-particle-transport
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { waveVsParticleTransportSchema } from './schema';
import { initialState, type WaveVsParticleTransportState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const waveVsParticleTransportBundle: Bundle<WaveVsParticleTransportState> = {
  schema: waveVsParticleTransportSchema,
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
