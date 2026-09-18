// ========================================================================
// @aperi21/sim-damped-oscillation
// ========================================================================
// 에너지가 빠져나가는 진동은 마루마다 바로 앞 마루의 같은 몫으로 줄고, 마루 사이
// 간격(주기)은 그대로다 — 액체 속 추의 높이를 펜이 옆으로 펼치고, 마루마다 막대와
// 같은 비(×0.70)를 남긴 뒤 그 끝을 포락선으로 잇는다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { dampedOscillationSchema } from './schema';
import { initialState, type DampedOscillationState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const dampedOscillationBundle: Bundle<DampedOscillationState> = {
  schema: dampedOscillationSchema,
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
