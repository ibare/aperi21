// ========================================================================
// @aperi21/sim-spherical-aberration
// ========================================================================
// 두 면이 구면인 볼록 렌즈에서 바깥 줄기일수록 렌즈 가까이에서 축을 건너 한 점에
// 모이지 못한다. 조리개로 바깥 줄기를 막으면 건너는 자리가 좁아진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { sphericalAberrationSchema } from './schema';
import { initialState, type SphericalAberrationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const sphericalAberrationBundle: Bundle<SphericalAberrationState> = {
  schema: sphericalAberrationSchema,
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
