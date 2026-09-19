// ========================================================================
// @aperi21/sim-birefringence
// ========================================================================
// 방해석 속에서 한 줄기가 떨림이 서로 직각인 o · e 두 줄기로 갈라져 밑의 글자가 두 겹으로 보인다 —
// 결정을 돌리면 e 상이 o 상 둘레를 돌고, 편광판을 얹어 돌리면 두 상이 번갈아 사라진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { birefringenceSchema } from './schema';
import { initialState, type BirefringenceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const birefringenceBundle: Bundle<BirefringenceState> = {
  schema: birefringenceSchema,
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
