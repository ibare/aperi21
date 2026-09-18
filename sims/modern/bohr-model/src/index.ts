// ========================================================================
// @aperi21/sim-bohr-model
// ========================================================================
// 전자는 반지름 n²a₀ 인 궤도에만 있고, 바깥에서 안쪽으로 건너뛸 때 두 준위의 차만큼의
// 빛 하나를 낸다 — n=3→2 는 빨간 656 nm, n=2→1 은 자외선 122 nm.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { bohrModelSchema } from './schema';
import { initialState, type BohrModelState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const bohrModelBundle: Bundle<BohrModelState> = {
  schema: bohrModelSchema,
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
