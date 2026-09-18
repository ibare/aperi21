import type { StageDef } from '@aperi21/schema';

import { readConstants } from './physics';

/**
 * 물결 · P 의 높이 · 마루 자리는 모두 조각 시계의 함수라 쌓는 것이 없다. 시계는 엔진이
 * 시간표 선언에서 `scene` 에 `params.timeline` 으로 준다 (S-sim).
 *
 * 상태에 남은 것은 조작기가 쓰는 두 값뿐이다.
 */
export interface WaveBasicsState {
  /** 파장 λ(m). 슬라이더 `wavelength` 가 이 경로에 쓴다. */
  wavelength: number;
  /** 진폭 A(m). 슬라이더 `amplitude` 가 이 경로에 쓴다. */
  amplitude: number;
}

/** 조작기의 출발값은 스테이지 상수다 — 저작자가 스테이지에서 바꾼다 (원칙 2). */
export function initialState(params: { stage: StageDef }): WaveBasicsState {
  const c = readConstants(params.stage);
  return { wavelength: c.wavelength, amplitude: c.amplitude };
}
