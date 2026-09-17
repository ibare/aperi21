import type { Vec2 } from '@aperi21/schema';

import { ZG, type CaptionCase } from './schema';
import { hullAtRelease, captionFlags } from './physics';

/**
 * 배 한 척. 기울기는 적분해 쌓이는 값이라 시각의 함수가 아니다.
 *
 * - `th` · `om` — 기울기(라디안, 반시계가 양) · 각속도(물리 시간).
 * - `trail` — 부심 자취. **몸체 좌표**(무게중심 원점)로 쌓아 배와 함께 돈다.
 * - `ticks` — 자취를 몇 걸음마다 찍을지 세는 수.
 * - `stableUpright` · `lollDeg` — 이 무게중심 높이에서 똑바로 선 자세가 안정한가, 아니면
 *   되세우기 시작하는 균형각(°). 조작값이 바뀔 때마다 기울기별 표로 다시 구한다.
 * - `pastLoll` · `phaseB` · `settled` — 캡션을 고르는 사건. 균형각을 지났는가, 그 뒤 처음
 *   되돌아섰는가, 똑바로 섰는가.
 */
export interface HullState {
  th: number;
  om: number;
  trail: readonly Vec2[];
  ticks: number;
  stableUpright: boolean;
  lollDeg: number;
  pastLoll: boolean;
  phaseB: boolean;
  settled: boolean;
}

/**
 * - `zg` — 조작기가 가리키는 무게중심 높이(m). 두 배가 함께 쓴다.
 * - `zgApplied` — 표 · 자취가 맞춰진 높이. `zg` 와 다르면 `step` 이 다시 맞춘다.
 * - `hulls` — 넓은 배 · 좁은 배 순서.
 * - `steps` — 흐른 고정 걸음 수. 주기 경계(14 초)를 가른다.
 * - `acc` — 고정 걸음(1/60 초)을 맞추는 누적기. 실시간 dt 는 가변이다 (G39).
 * - `cap` — 캡션 조합마다 지금 참인가. 캡션 슬롯 `cases` 가 가리킨다.
 */
export interface StabilityOfFloatingBodyState {
  zg: number;
  zgApplied: number;
  hulls: readonly HullState[];
  steps: number;
  acc: number;
  cap: Record<CaptionCase, boolean>;
}

/** 두 배가 같은 높이의 무게중심을 가진 채 같은 8° 기울기에서 막 놓였다. */
export function initialState(): StabilityOfFloatingBodyState {
  const hulls = [0, 1].map((i) => hullAtRelease(i, ZG.default));
  return {
    zg: ZG.default,
    zgApplied: ZG.default,
    hulls,
    steps: 0,
    acc: 0,
    cap: captionFlags(hulls),
  };
}
