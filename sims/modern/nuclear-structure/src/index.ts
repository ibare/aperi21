// ========================================================================
// @aperi21/sim-nuclear-structure
// ========================================================================
// 양성자 수(Z)가 원소를, 중성자 수가 동위원소를 가른다. 탄소-12 에 중성자 둘이
// 들어와도 기호는 C 그대로이고, 탄소-14 의 중성자 하나가 양성자로 바뀌면 질량수는
// 그대로인데 기호가 N 이 된다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { nuclearStructureSchema } from './schema';
import { initialState, type NuclearStructureState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const nuclearStructureBundle: Bundle<NuclearStructureState> = {
  schema: nuclearStructureSchema,
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
