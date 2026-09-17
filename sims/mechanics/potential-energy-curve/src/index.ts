// ========================================================================
// @aperi21/sim-potential-energy-curve
// ========================================================================
// 물체는 전체 에너지 선이 퍼텐셜 곡선과 만나는 점에서 되돌아온다. 선의 높이가
// 곡선의 어느 골짜기 · 언덕까지 닿는지가 물체가 오갈 수 있는 범위를 정한다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/potential-energy-curve).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { potentialEnergyCurveSchema } from './schema';
import { initialState, type PotentialEnergyCurveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const potentialEnergyCurveBundle: Bundle<PotentialEnergyCurveState> = {
  schema: potentialEnergyCurveSchema,
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
