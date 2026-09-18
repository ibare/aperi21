// ========================================================================
// @aperi21/sim-shell-theorem
// ========================================================================
// 속 빈 껍질 안에 들어가면 당김이 사라진다 — 안의 어느 자리, 어느 방향이든 가까운 쪽
// 좁은 조각과 먼 쪽 넓은 조각이 같은 크기로 맞서 당겨 합이 0 이다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { shellTheoremSchema } from './schema';
import { initialState, type ShellTheoremState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const shellTheoremBundle: Bundle<ShellTheoremState> = {
  schema: shellTheoremSchema,
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
