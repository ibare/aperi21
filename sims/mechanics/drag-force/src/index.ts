// ========================================================================
// @aperi21/sim-drag-force
// ========================================================================
// 빨라질수록 저항 중 속도 제곱에 비례하는 몫이 가파르게 불어난다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/drag-force).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { dragForceSchema } from './schema';
import { initialState, type DragForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const dragForceBundle: Bundle<DragForceState> = {
  schema: dragForceSchema,
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
