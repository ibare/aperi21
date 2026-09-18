// ========================================================================
// @aperi21/sim-surface-tension
// ========================================================================
// 물보다 무거운 바늘이 어떻게 물 위에 뜨는가 — 수면이 막처럼 휘어 받친다. 막이 당기는
// 힘 T 는 크기가 그대로이고 휜 만큼 위로 돌아서며, 곧추선 뒤로는 뚫린다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { surfaceTensionSchema } from './schema';
import { initialState, type SurfaceTensionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const surfaceTensionBundle: Bundle<SurfaceTensionState> = {
  schema: surfaceTensionSchema,
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
