// ========================================================================
// @aperi21/sim-youngs-double-slit
// ========================================================================
// 슬릿을 하나 더 열어 빛을 보태면, 스크린의 어떤 줄은 슬릿 하나일 때보다 오히려 꺼진다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/youngs-double-slit).
// 자유 렌더 없이 선언만으로 옮겼다 — 물결 합성 · 스크린 세기는 조각이 계산한다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { youngsDoubleSlitSchema } from './schema';
import { initialState, type YoungsDoubleSlitState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const youngsDoubleSlitBundle: Bundle<YoungsDoubleSlitState> = {
  schema: youngsDoubleSlitSchema,
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
