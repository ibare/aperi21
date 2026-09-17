import type { Vec2 } from '@aperi21/schema';

import { freshState } from './physics';

/**
 * 온도장 · 입자 · 덩어리는 모두 적분으로 쌓이는 상태다. 좌표는 원본 좌표(가로 0~3 · 세로 0~1, y 위로).
 *
 * - `field` — 격자 온도 96 × 32. **행 우선, 첫 행이 바닥**(원본 배열 순서). scene 이 위아래를 뒤집어 넘긴다.
 * - `flow` — 슬라이더가 가리키는 흐름 세기.
 * - `amp` — 실제 흐름 세기. `flow` 를 부드럽게 따라간다.
 * - `t` — 원본 시계. 속도장의 흔들림이 이 값을 읽는다.
 * - `acc` — 고정 걸음(1/60 초)을 맞추는 누적기. 실시간 dt 는 가변이다.
 * - `tracers` — 흐름 표시 입자 90 개의 자리.
 * - `parcel` · `parcelTemp` · `trail` — 따라가는 덩어리의 자리 · 지닌 온도 · 자취(최근 110 걸음).
 * - `stopped` — 실제 흐름 세기가 0.08 미만일 때 true. 캡션 슬롯 `cases` 가 읽는다.
 */
export interface ThermalConvectionState {
  field: readonly number[];
  flow: number;
  amp: number;
  t: number;
  acc: number;
  tracers: readonly Vec2[];
  parcel: Vec2;
  parcelTemp: number;
  trail: readonly Vec2[];
  stopped: boolean;
}

export function initialState(): ThermalConvectionState {
  return freshState();
}
