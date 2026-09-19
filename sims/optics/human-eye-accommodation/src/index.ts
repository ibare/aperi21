// ========================================================================
// @aperi21/sim-human-eye-accommodation
// ========================================================================
// 수정체와 망막 사이 거리는 그대로라, 가까운 것을 볼 때 눈은 수정체를 두껍게 해
// 초점 거리를 줄여 다시 망막 위에 모은다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { humanEyeAccommodationSchema } from './schema';
import { initialState, type HumanEyeAccommodationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const humanEyeAccommodationBundle: Bundle<HumanEyeAccommodationState> = {
  schema: humanEyeAccommodationSchema,
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
