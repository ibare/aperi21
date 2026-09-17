// ========================================================================
// @aperi21/sim-energy-flow-diagram
// ========================================================================
// 석탄 에너지는 발전소 · 송전선 · 전구를 지날 때마다 열 갈래로 갈라져 나간다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/energy-flow-diagram).
// 자유 렌더 없이 선언만으로 옮겼다 — 모자란 어휘는 NOTES.md 「어휘 부족」.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { energyFlowDiagramSchema } from './schema';
import { initialState, type EnergyFlowDiagramState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const energyFlowDiagramBundle: Bundle<EnergyFlowDiagramState> = {
  schema: energyFlowDiagramSchema,
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
