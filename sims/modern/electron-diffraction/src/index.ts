// ========================================================================
// @aperi21/sim-electron-diffraction
// ========================================================================
// 흑연 박막을 지난 전자들이 형광 스크린에 동심 고리를 그린다. 가속 전압을 올려
// 전자를 빠르게 하면 파장이 짧아져 고리가 안쪽으로 좁아진다.
//
// 자유 구현 원본이 없다. 엔진 어휘로 곧바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { electronDiffractionSchema } from './schema';
import { initialState, type ElectronDiffractionState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const electronDiffractionBundle: Bundle<ElectronDiffractionState> = {
  schema: electronDiffractionSchema,
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
