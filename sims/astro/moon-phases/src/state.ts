import type { Vec2 } from '@aperi21/schema';
import { moonAt, overlapFlags, period } from './physics';
import { moonPhasesSchema } from './schema';

/**
 * 상태.
 *
 * 달의 자리는 시각의 함수다. 쌓는 것은 끌기가 더한 위상 차이(`offset`) 하나이고, 나머지는
 * 그것을 선언이 읽을 수 있게 펼쳐 둔 것이다.
 * - `t` — 조각 시계. `step` 이 시간표를 받지 못해 따로 센다 (NOTES 「어휘 부족」 G01).
 * - `moonPos` · `held` — `point-drag` 손잡이 자리와 잡힘.
 * - `noOverlap` · `fullOverlap` — 캡션 슬롯 `cases` 가 읽는 겹침 판정.
 */
export interface MoonPhasesState {
  t: number;
  offset: number;
  moonPos: Vec2;
  held: boolean;
  noOverlap: boolean;
  fullOverlap: boolean;
}

export function initialState(): MoonPhasesState {
  // 러너는 `startAt` 만큼 앞당긴 시계에서 걸음을 시작하므로 상태 시계도 같은 자리에서 연다.
  const t = moonPhasesSchema.startAt ?? 0;
  const theta = (2 * Math.PI * t) / period();
  return { t, offset: 0, moonPos: moonAt(theta), held: false, ...overlapFlags(theta) };
}
