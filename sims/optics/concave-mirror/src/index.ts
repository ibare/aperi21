// ========================================================================
// @aperi21/sim-concave-mirror
// ========================================================================
// 오목거울 앞의 물체를 C 바깥 → C 와 F 사이 → F 안쪽으로 옮기면, 비친 줄기가 거울 앞에서
// 만나 거꾸로 선 실상이 서다가, F 안쪽에서는 거울 뒤로 이은 점선이 만나 바로 선 허상이 된다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { concaveMirrorSchema } from './schema';
import { initialState, type ConcaveMirrorState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const concaveMirrorBundle: Bundle<ConcaveMirrorState> = {
  schema: concaveMirrorSchema,
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
