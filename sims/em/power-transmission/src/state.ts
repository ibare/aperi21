// ========================================================================
// power-transmission — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. state 에 두는 것은 캡션 `vars` 가 가리킬
// **선언값의 글자** 뿐이다 — 캡션 `vars` 가 state 경로만 가리키므로(장부 G133) 스테이지
// 상수를 여기서 한 번 글자로 옮긴다. 계산해 줄이지 않는다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { readConstants } from './physics';

export interface PowerTransmissionState {
  /** 보내는 전력(kW) · 위 · 아래 송전 전압(kV) — 선언값 그대로. */
  power: string;
  voltageLow: string;
  voltageHigh: string;
  /** 표시 정박값 — 전압 배수 · 손실 분모(선언값 그대로). */
  voltageFactor: string;
  lossDivisor: string;
}

export function initialState(params: { stage: StageDef }): PowerTransmissionState {
  const c = readConstants(params.stage);
  return {
    power: String(c.power),
    voltageLow: String(c.voltageLow),
    voltageHigh: String(c.voltageHigh),
    voltageFactor: String(c.voltageFactor),
    lossDivisor: String(c.lossDivisor),
  };
}
