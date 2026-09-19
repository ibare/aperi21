// ========================================================================
// @aperi21/sim-mean-free-path
// ========================================================================
// 평균 자유 행로 — 분자를 두 배로 빽빽하게 하면 한 분자가 다음 충돌까지 가는
// 거리가 절반이 된다. 두 상자(밀도 n · 2n)에서 표시 분자를 나란히 따라가고, 충돌
// 사이 구간 길이의 평균 막대가 1 : 1/2 로 선다.
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 짓는다 (자유 렌더 없음).
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { meanFreePathSchema } from './schema';
import { initialState, type MeanFreePathState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const meanFreePathBundle: Bundle<MeanFreePathState> = {
  schema: meanFreePathSchema,
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
