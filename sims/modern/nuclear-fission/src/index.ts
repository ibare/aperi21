// ========================================================================
// @aperi21/sim-nuclear-fission
// ========================================================================
// 느린 중성자 하나를 삼킨 우라늄-235 가 들뜬 우라늄-236 으로 흔들리다 늘어나
// 두 중간 핵(바륨-141 · 크립톤-92)과 중성자 셋으로 갈라지고, 두 조각이 서로 밀어내며
// 약 200 MeV 를 싣고 날아간다. 알갱이 수는 그대로다(235 + 1 = 141 + 92 + 3).
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { nuclearFissionSchema } from './schema';
import { initialState, type NuclearFissionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const nuclearFissionBundle: Bundle<NuclearFissionState> = {
  schema: nuclearFissionSchema,
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
