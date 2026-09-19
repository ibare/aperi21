// ========================================================================
// @aperi21/sim-magnifying-glass
// ========================================================================
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다. 자유 렌더(`renderers`)를 쓰지 않는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { magnifyingGlassSchema } from './schema';
import { initialState, type MagnifyingGlassState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const magnifyingGlassBundle: Bundle<MagnifyingGlassState> = {
  schema: magnifyingGlassSchema,
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
