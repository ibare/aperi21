import type { DoubleSlitWithElectronsState } from './state';

/** 항등 — 누적할 것이 없다. 도착 목록은 시각의 함수다 (`model.ts`). */
export function step(params: { state: DoubleSlitWithElectronsState; dt: number }): DoubleSlitWithElectronsState {
  return params.state;
}
