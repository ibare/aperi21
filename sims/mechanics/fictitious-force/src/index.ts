// ========================================================================
// @aperi21/sim-fictitious-force
// ========================================================================
// 관성력도 중력처럼 질량에 비례하므로, 도는 그네에 매달린 무거운 추와 가벼운 추는
// 언제나 같은 각도로 기운다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/fictitious-force).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { fictitiousForceSchema } from './schema';
import { initialState, type FictitiousForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const fictitiousForceBundle: Bundle<FictitiousForceState> = {
  schema: fictitiousForceSchema,
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
