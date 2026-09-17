// ========================================================================
// @aperi21/sim-phase-space
// ========================================================================
// 마찰이 있으면 위상 평면의 상태점은 제 에너지 고리를 가로질러 바닥 한 점으로
// 감겨 든다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/phase-space).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { phaseSpaceSchema } from './schema';
import { initialState, type PhaseSpaceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const phaseSpaceBundle: Bundle<PhaseSpaceState> = {
  schema: phaseSpaceSchema,
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
