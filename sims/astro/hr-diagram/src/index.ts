// ========================================================================
// @aperi21/sim-hr-diagram
// ========================================================================
// 같은 때 태어난 별 무리가 나이 들면 무거운 별부터 주계열 띠를 떠난다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/hr-diagram). 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { hrDiagramSchema } from './schema';
import { initialState, type HrDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const hrDiagramBundle: Bundle<HrDiagramState> = {
  schema: hrDiagramSchema,
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
