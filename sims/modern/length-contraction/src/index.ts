// ========================================================================
// @aperi21/sim-length-contraction
// ========================================================================
// 빠르게 지나가는 상자는 정지한 틀에서 진행 방향으로만 짧다 — 멈춘 쌍둥이의
// 「제 길이 자리」 에 위아래는 꼭 맞고 앞뒤만 모자란다 (L = L₀/γ).
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { lengthContractionSchema } from './schema';
import { initialState, type LengthContractionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const lengthContractionBundle: Bundle<LengthContractionState> = {
  schema: lengthContractionSchema,
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
