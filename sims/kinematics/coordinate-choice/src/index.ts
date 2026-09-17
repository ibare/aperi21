// ========================================================================
// @aperi21/sim-coordinate-choice
// ========================================================================
// 같은 빗면 미끄럼이라도 축을 빗면에 맞추면 한 축 방향의 운동이 사라진다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/coordinate-choice).
// 자유 렌더 없이 선언만으로 성립한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { coordinateChoiceSchema } from './schema';
import { initialState, type CoordinateChoiceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const coordinateChoiceBundle: Bundle<CoordinateChoiceState> = {
  schema: coordinateChoiceSchema,
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
