// ========================================================================
// @aperi21/sim-thin-lens
// ========================================================================
// 상이 어디에 맺히는지는 재는 것이 아니라 **긋는 것**이다 — 물체 끝에서 나가는
// 빛 가운데 가는 길이 미리 정해진 셋(축에 평행 · 렌즈 한가운데 · 앞쪽 초점)을
// 그으면 렌즈 뒤 한 점에서 만나고, 그 점이 상 끝이다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thinLensSchema } from './schema';
import { initialState, type ThinLensState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thinLensBundle: Bundle<ThinLensState> = {
  schema: thinLensSchema,
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
