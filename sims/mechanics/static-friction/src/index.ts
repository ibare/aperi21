// ========================================================================
// @aperi21/sim-static-friction
// ========================================================================
// 정지 마찰력은 당기는 힘을 따라 똑같이 커지며 버티다가, 한계를 넘는 순간 놓치고
// 상자가 미끄러진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/static-friction).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { staticFrictionSchema } from './schema';
import { initialState, type StaticFrictionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const staticFrictionBundle: Bundle<StaticFrictionState> = {
  schema: staticFrictionSchema,
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
