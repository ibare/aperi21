// ========================================================================
// @aperi21/sim-specular-diffuse-reflection
// ========================================================================
// 나란히 들어온 빛줄기가 매끈한 면에서는 나란히 되튀고, 확대한 거친 면에서는
// 사방으로 흩어진다 — 줄기마다 닿은 자리의 작은 법선이 제각각 기울어 있다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { specularDiffuseReflectionSchema } from './schema';
import { initialState, type SpecularDiffuseReflectionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const specularDiffuseReflectionBundle: Bundle<SpecularDiffuseReflectionState> = {
  schema: specularDiffuseReflectionSchema,
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
