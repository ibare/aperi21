// ========================================================================
// @aperi21/sim-spacetime-diagram
// ========================================================================
// 움직이는 관찰자의 동시선이 기울어, 한꺼번에 일어난 세 사건이 차례로 '지금'에 닿는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/spacetime-diagram).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { spacetimeDiagramSchema } from './schema';
import { initialState, type SpacetimeDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const spacetimeDiagramBundle: Bundle<SpacetimeDiagramState> = {
  schema: spacetimeDiagramSchema,
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
