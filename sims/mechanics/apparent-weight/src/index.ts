// ========================================================================
// @aperi21/sim-apparent-weight
// ========================================================================
// 엘리베이터 안 저울 눈금은 빨리 움직일 때가 아니라 속도가 바뀌는 동안에만
// 평소 눈금에서 벗어난다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/apparent-weight).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { apparentWeightSchema } from './schema';
import { initialState, type ApparentWeightState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const apparentWeightBundle: Bundle<ApparentWeightState> = {
  schema: apparentWeightSchema,
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
