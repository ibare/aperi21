// ========================================================================
// @aperi21/sim-vertical-loop
// ========================================================================
// 꼭대기에 닿기 전에 레일이 미는 힘이 0 이 되면 공은 레일을 떠나 떨어지고,
// 꼭대기에서도 최소 속력보다 빠른 공만 레일에 눌린 채 계속 돈다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/vertical-loop).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { verticalLoopSchema } from './schema';
import { initialState, type VerticalLoopState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const verticalLoopBundle: Bundle<VerticalLoopState> = {
  schema: verticalLoopSchema,
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
