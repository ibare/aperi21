// ========================================================================
// @aperi21/sim-heat-conduction
// ========================================================================
// 같은 불에 같은 시간을 두어도 쇠에서는 뜨거움이 막대를 타고 끝까지 번져 나가고,
// 나무에서는 데운 자리에 머문다.
//
// 원본은 엔진 없이 손으로 짠 것이다 (tasks/piece-lab/heat-conduction).
// 자유 렌더를 쓰지 않는다 — 달아오름은 격자 칸마다의 `region`, 프리롤은
// `schema.preroll`, 캡션은 캡션 슬롯의 `cases` 로 옮겼다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { heatConductionSchema } from './schema';
import { initialState, type HeatConductionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const heatConductionBundle: Bundle<HeatConductionState> = {
  schema: heatConductionSchema,
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
