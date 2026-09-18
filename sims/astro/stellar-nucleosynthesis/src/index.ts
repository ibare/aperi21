// ========================================================================
// @aperi21/sim-stellar-nucleosynthesis
// ========================================================================
// 무거운 별의 중심에 타고 남은 재가 한 겹씩 쌓여 양파가 되고, 겹마다 원자핵이
// 핵자당 결합 에너지 곡선을 오른다. 꼭대기가 철이라 그 너머는 에너지를 먹는다 —
// 핵융합은 철에서 멈춘다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { stellarNucleosynthesisSchema } from './schema';
import { initialState, type StellarNucleosynthesisState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const stellarNucleosynthesisBundle: Bundle<StellarNucleosynthesisState> = {
  schema: stellarNucleosynthesisSchema,
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
