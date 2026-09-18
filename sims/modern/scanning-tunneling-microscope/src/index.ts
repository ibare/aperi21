// ========================================================================
// @aperi21/sim-scanning-tunneling-microscope
// ========================================================================
// 주사 터널 현미경 — 터널 전류가 틈 `decadeGap`(기본 0.1 nm) 마다 약 10 배로 변할 만큼 민감해서,
// 전류를 일정하게 두도록 탐침 높이를 조절하며 훑으면 그 높이 기록이 원자 하나하나의 윤곽이 된다.
//
// 캡션의 `{gap}` 은 state(`initialState` 가 `decadeGap` 을 글자로 옮김)를 거쳐 끼운다 (G133 우회로).
//
// 자유 구현 원본 없이 엔진 어휘 위에서 바로 지었다.
// ========================================================================

import type { Bundle } from '@aperi21/schema';

import { scanningTunnelingMicroscopeSchema } from './schema';
import { initialState, type ScanningTunnelingMicroscopeState } from './state';
import { step } from './physics';
import { boundsHint, scene } from './scene';
import { controllers } from './controllers';

export const scanningTunnelingMicroscopeBundle: Bundle<ScanningTunnelingMicroscopeState> = {
  schema: scanningTunnelingMicroscopeSchema,
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
