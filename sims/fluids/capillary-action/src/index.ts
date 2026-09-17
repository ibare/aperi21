// ========================================================================
// @aperi21/sim-capillary-action
// ========================================================================
// 오목한 물 면 아래의 압력 부족을 기둥 무게가 메울 때까지 물이 오른다.
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/capillary-action).
// 자유 렌더 없이 선언만으로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { capillaryActionSchema } from './schema';
import { initialState, type CapillaryActionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const capillaryActionBundle: Bundle<CapillaryActionState> = {
  schema: capillaryActionSchema,
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
