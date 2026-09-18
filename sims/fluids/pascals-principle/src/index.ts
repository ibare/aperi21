// ========================================================================
// @aperi21/sim-pascals-principle
// ========================================================================
// 작은 피스톤을 F 로 누르면 같은 압력 화살표가 두 피스톤 밑에 폭마다 하나씩 선다 —
// 넓이가 N 배인 큰 피스톤은 N 개, 곧 N 배 힘으로 밀려 오르고 대신 d/N 만 오른다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { pascalsPrincipleSchema } from './schema';
import { initialState, type PascalsPrincipleState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const pascalsPrincipleBundle: Bundle<PascalsPrincipleState> = {
  schema: pascalsPrincipleSchema,
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
