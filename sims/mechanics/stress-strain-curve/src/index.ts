// ========================================================================
// @aperi21/sim-stress-strain-curve
// ========================================================================
// 곡선이 꺾인 곳을 넘도록 당겼다가 놓으면, 막대는 올라온 곡선을 되짚지 않고
// 처음 기울기와 같은 곧은 선으로 내려와 늘어난 채로 남는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/stress-strain-curve).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { stressStrainCurveSchema } from './schema';
import { initialState, type StressStrainCurveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const stressStrainCurveBundle: Bundle<StressStrainCurveState> = {
  schema: stressStrainCurveSchema,
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
