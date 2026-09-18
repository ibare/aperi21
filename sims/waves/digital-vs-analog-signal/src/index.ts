// ========================================================================
// @aperi21/sim-digital-vs-analog-signal
// ========================================================================
// 디지털 신호와 아날로그 — 같은 선로 · 같은 잡음을 지나도 아날로그 중계기는 잡음까지
// 키워 곡선이 칸마다 거칠어지고, 디지털 중계기는 문턱으로 0 · 1 을 다시 판정해 계단이
// 칸마다 원래 모양으로 되살아난다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { digitalVsAnalogSignalSchema } from './schema';
import { initialState, type DigitalVsAnalogSignalState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const digitalVsAnalogSignalBundle: Bundle<DigitalVsAnalogSignalState> = {
  schema: digitalVsAnalogSignalSchema,
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
