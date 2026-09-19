// ========================================================================
// @aperi21/sim-potential-vs-field
// ========================================================================
// 전기장의 세기는 전위 그래프의 기울기다 — 같은 x 축 위에 V(x) 곡선과 E 화살표를
// 위아래로 맞대어, 탐침이 훑는 자리마다 곡선이 가파르면 화살표가 길고 평평하면 0 이며
// 화살표는 전위가 내려가는 쪽을 가리킨다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { potentialVsFieldSchema } from './schema';
import { initialState, type PotentialVsFieldState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const potentialVsFieldBundle: Bundle<PotentialVsFieldState> = {
  schema: potentialVsFieldSchema,
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
