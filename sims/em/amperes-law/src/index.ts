// ========================================================================
// @aperi21/sim-amperes-law
// ========================================================================
// 전류를 감싼 닫힌 길을 걸으며 B 의 길 방향 몫을 막대에 쌓으면, 길의 모양과 상관없이
// 한 바퀴의 합이 μ₀I 에 닿고, 전류를 감싸지 않은 길은 0 으로 돌아온다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { amperesLawSchema } from './schema';
import { initialState, type AmperesLawState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const amperesLawBundle: Bundle<AmperesLawState> = {
  schema: amperesLawSchema,
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
