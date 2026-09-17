// ========================================================================
// @aperi21/sim-angle-of-friction
// ========================================================================
// 무게가 달라도 같은 면 위라면 같은 각에서 함께 미끄러지기 시작한다 — 미끄러지는 각은
// 무게가 아니라 면이 정한다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/angle-of-friction).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { angleOfFrictionSchema } from './schema';
import { initialState, type AngleOfFrictionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const angleOfFrictionBundle: Bundle<AngleOfFrictionState> = {
  schema: angleOfFrictionSchema,
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
