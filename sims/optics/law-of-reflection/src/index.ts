// ========================================================================
// @aperi21/sim-law-of-reflection
// ========================================================================
// 거울에 들어온 빛과 나간 빛은 법선을 사이에 두고 같은 각을 이룬다 — 입사각을
// 20° → 45° → 70° 로 눕히면 반사각이 같은 값으로 따라가고 두 호가 거울상이다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lawOfReflectionSchema } from './schema';
import { initialState, type LawOfReflectionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lawOfReflectionBundle: Bundle<LawOfReflectionState> = {
  schema: lawOfReflectionSchema,
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
