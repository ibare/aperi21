// ========================================================================
// @aperi21/sim-normal-force
// ========================================================================
// 바닥은 무게만큼 미는 것이 아니라 뚫리지 않을 만큼만 민다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/normal-force).
// 자유 렌더를 쓰지 않는다 — 막대 힘의 한 바퀴는 `schema.timeline`, 접촉·뜸은 `step`,
// 캡션은 캡션 슬롯의 `cases` 로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { normalForceSchema } from './schema';
import { initialState, type NormalForceState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const normalForceBundle: Bundle<NormalForceState> = {
  schema: normalForceSchema,
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
