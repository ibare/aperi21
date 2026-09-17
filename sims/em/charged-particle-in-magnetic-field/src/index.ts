// ========================================================================
// @aperi21/sim-charged-particle-in-magnetic-field
// ========================================================================
// 자기장 속에서 빠른 전하는 큰 원을 돌지만 한 바퀴 시간은 같다 — 속력이 다른 전하들이
// 한 줄로 선 채 돌다가 같은 순간 출발점으로 돌아온다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/charged-particle-in-magnetic-field).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { chargedParticleInMagneticFieldSchema } from './schema';
import { initialState, type ChargedParticleInMagneticFieldState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const chargedParticleInMagneticFieldBundle: Bundle<ChargedParticleInMagneticFieldState> = {
  schema: chargedParticleInMagneticFieldSchema,
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
