// ========================================================================
// @aperi21/sim-phase-diagram
// ========================================================================
// 삼중점보다 낮은 압력에서 고체를 데우면 액체 구간을 건너뛰고 곧바로 기체가 된다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/phase-diagram).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { phaseDiagramSchema } from './schema';
import { initialState, type PhaseDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const phaseDiagramBundle: Bundle<PhaseDiagramState> = {
  schema: phaseDiagramSchema,
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
