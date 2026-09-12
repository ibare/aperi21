// ========================================================================
// @aperi21/sim-apparent-brightness
// ========================================================================
// 별이 낸 빛 한 묶음은 멀어질수록 거리의 제곱만큼 넓은 면에 나뉘어, 같은 크기의
// 한 칸이 받는 양이 36 → 9 → 4 로 줄고 그만큼 옅게 보인다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/apparent-brightness).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { apparentBrightnessSchema } from './schema';
import { initialState, type ApparentBrightnessState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const apparentBrightnessBundle: Bundle<ApparentBrightnessState> = {
  schema: apparentBrightnessSchema,
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
