// ========================================================================
// @aperi21/sim-convex-mirror
// ========================================================================
// 볼록거울 앞의 물체를 멀리서 가까이 옮겨도 거울 뒤로 이은 점선이 F 안쪽에서 만나 작고
// 바로 선 허상이 선다. 같은 폭의 평면거울과 나란히 두면 눈이 받는 시야가 훨씬 넓다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { convexMirrorSchema } from './schema';
import { initialState, type ConvexMirrorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const convexMirrorBundle: Bundle<ConvexMirrorState> = {
  schema: convexMirrorSchema,
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
