import { step } from './physics';
import { MEDIA, totalInternalReflectionSchema } from './schema';

/**
 * 그림은 시각과 조작값의 함수다. 상태가 드는 것은 조작 인계와 캡션 판정 몫뿐이다.
 *
 * - `clock` — 조각 시계. `step` 은 `TimelineFrame` 을 받지 못해 선언된 시간표를 따로 센다
 *   (NOTES 「어휘 부족」). `startAt` 에서 출발한다.
 * - `n` — 아래 매질의 굴절률. 매질 버튼(`param-chips`)이 쓴다.
 * - `dragPos` · `dragHeld` — 장면 끌기(`point-drag`)가 쓰는 자리. 잡지 않았을 때는 광원 자리를 적어
 *   손잡이가 광원 위에 놓이게 한다.
 * - `manual` — 독자가 각을 쥐고 있는가. 손을 뗀 뒤 `idle` 이 5 초를 넘으면 false.
 * - `manualDeg` — 독자가 정한 입사각(도). `blend` — 1 이면 그 각, 0 이면 자동 각.
 * - `angleDeg` — 이번 걸음의 입사각(도). scene 이 조작 중일 때 이것을 쓴다.
 * - `cap*` — 캡션 슬롯 `cases` 가 보는 자리.
 */
export interface TotalInternalReflectionState {
  clock: number;
  n: number;
  dragPos: readonly [number, number];
  dragHeld: boolean;
  manual: boolean;
  idle: number;
  manualDeg: number;
  blend: number;
  angleDeg: number;
  capFar: boolean;
  capNear: boolean;
  capTotal: boolean;
}

/** 첫 화면의 입사각 · 손잡이 자리 · 캡션 판정을 채우려고 0 초 걸음을 한 번 건넨다. */
export function initialState(): TotalInternalReflectionState {
  const base: TotalInternalReflectionState = {
    clock: totalInternalReflectionSchema.startAt ?? 0,
    n: MEDIA.water,
    dragPos: [0, 0],
    dragHeld: false,
    manual: false,
    idle: 0,
    manualDeg: 0,
    blend: 0,
    angleDeg: 0,
    capFar: true,
    capNear: false,
    capTotal: false,
  };
  return step({ state: base, dt: 0 });
}
