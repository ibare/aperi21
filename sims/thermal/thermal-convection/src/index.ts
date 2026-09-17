// ========================================================================
// @aperi21/sim-thermal-convection
// ========================================================================
// 바닥에서 데워진 유체가 제 열을 지닌 채 솟아 천장까지 올라간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/thermal-convection).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { thermalConvectionSchema } from './schema';
import { initialState, type ThermalConvectionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const thermalConvectionBundle: Bundle<ThermalConvectionState> = {
  schema: thermalConvectionSchema,
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
