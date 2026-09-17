// ========================================================================
// @aperi21/sim-electromagnetic-wave
// ========================================================================
// 전하가 흔들기를 멈춰도, 이미 만들어진 전기장과 자기장은 전하에서 끊겨 나와 닫힌 고리가
// 되어 스스로 계속 나아간다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/electromagnetic-wave).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { electromagneticWaveSchema } from './schema';
import { initialState, type ElectromagneticWaveState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const electromagneticWaveBundle: Bundle<ElectromagneticWaveState> = {
  schema: electromagneticWaveSchema,
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
