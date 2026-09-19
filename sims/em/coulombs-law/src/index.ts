// ========================================================================
// @aperi21/sim-coulombs-law
// ========================================================================
// 거리를 두 배로 하면 힘은 1/4, 세 배면 1/9 — 같은 +전하 쌍 셋을 r · 2r · 3r 로
// 벌려 힘 화살표가 점선 기준의 네 칸 중 한 칸 · 아홉 칸 중 한 칸에 멈추는 것을 보인다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { coulombsLawSchema } from './schema';
import { initialState, type CoulombsLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const coulombsLawBundle: Bundle<CoulombsLawState> = {
  schema: coulombsLawSchema,
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
