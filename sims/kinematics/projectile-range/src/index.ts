// ========================================================================
// @aperi21/sim-projectile-range
// ========================================================================
// 같은 속력으로 다섯 각도에 쏘면 45° 가 가장 멀리 가고, 45° 를 사이에 두고
// 같은 만큼 벌어진 짝(30°·60°, 15°·75°)은 같은 자리에 내려앉는다. 뒤늦게 온
// 공이 이미 있는 자국 **위에** 내려앉는 것이 화면에서 일어나는 일이다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { projectileRangeSchema } from './schema';
import { initialState, type ProjectileRangeState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const projectileRangeBundle: Bundle<ProjectileRangeState> = {
  schema: projectileRangeSchema,
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
