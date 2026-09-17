// ========================================================================
// @aperi21/sim-color-addition
// ========================================================================
// 빛은 겹치는 자리에서 더해진다 — 빨강 + 초록 = 노랑, 셋 = 흰색.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/color-addition).
// 자유 렌더 없이 선언만으로 옮겼다. 빛 원판은 빛의 색(`light: { rgb }`)을 더해(`blend: 'add'`) 칠한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { colorAdditionSchema } from './schema';
import { initialState, type ColorAdditionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const colorAdditionBundle: Bundle<ColorAdditionState> = {
  schema: colorAdditionSchema,
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
