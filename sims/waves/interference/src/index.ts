// ========================================================================
// @aperi21/sim-interference
// ========================================================================
// 두 파원의 물결이 겹치면 어떤 자리는 두 물결이 서로를 지워 줄지어 잠잠해진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/interference).
// 자유 렌더 없이 선언만으로 옮겼고, 수면 높이장은 region 칸 격자로 근사했다
// (NOTES.md 「어휘 부족」).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { interferenceSchema } from './schema';
import { initialState, type InterferenceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const interferenceBundle: Bundle<InterferenceState> = {
  schema: interferenceSchema,
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
