// ========================================================================
// @aperi21/sim-river-crossing
// ========================================================================
// 뱃머리를 맞은편 정면에 두어도 배는 물살에 떠밀려 하류에 닿는다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/river-crossing).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { riverCrossingSchema } from './schema';
import { initialState, type RiverCrossingState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const riverCrossingBundle: Bundle<RiverCrossingState> = {
  schema: riverCrossingSchema,
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
