// ========================================================================
// @aperi21/sim-conservative-force
// ========================================================================
// 같은 A 에서 같은 B 로, 위로 넘는 길과 아래로 도는 길. 중력이 한 일 막대는
// 한쪽은 깎였다 되찾고 한쪽은 넘쳤다 돌려주지만, 둘 다 높이 차 h 에서 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { conservativeForceSchema } from './schema';
import { initialState, type ConservativeForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const conservativeForceBundle: Bundle<ConservativeForceState> = {
  schema: conservativeForceSchema,
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
