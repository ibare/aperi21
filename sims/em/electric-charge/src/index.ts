// ========================================================================
// @aperi21/sim-electric-charge
// ========================================================================
// 전하 — 크기가 같은 전하를 띤 공 세 쌍을 같은 실에 매달면, 같은 종류(+ · +, − · −)는
// 밀어 벌어지고 다른 종류(+ · −)는 당겨 붙는다. 바뀐 것은 부호 표식 하나다.
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { electricChargeSchema } from './schema';
import { initialState, type ElectricChargeState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const electricChargeBundle: Bundle<ElectricChargeState> = {
  schema: electricChargeSchema,
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
