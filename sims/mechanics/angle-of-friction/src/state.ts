// ========================================================================
// angle-of-friction — 상태
// ========================================================================
// 판의 기울기와 상자의 투명도는 시각의 함수라 scene 이 시간표에서 읽는다. 상태가 담는
// 것은 **누적**뿐이다 — 판 위를 미끄러진 자리와 속력, 이번 회차의 더미 수, 지난
// 회차들의 기록, 독자가 슬라이더로 정한 수.
// ========================================================================

import { AUTO_SEQ, LAYOUT, THETA_S_DEG } from './schema';

export interface AngleOfFrictionState {
  /**
   * 조각 시계(초). `step` 이 `dt` 를 쌓는다. 선언된 시간표를 다시 읽어 지금 단계를
   * 아는 데만 쓴다 — `step` 은 `TimelineFrame` 을 받지 못한다 (NOTES 「어휘 부족」).
   */
  clock: number;
  /** 지난 걸음의 회차 번호와 단계 id. 단계가 넘어가는 순간을 알아채는 데 쓴다. */
  cycle: number;
  phase: string;

  /** 이번 회차 무거운 쪽 상자 수. 원본 `S.n`. */
  n: number;
  /** 독자가 슬라이더로 정한 수. 건드린 적 없으면 null. 원본 `userN`. */
  userN: number | null;
  /** 슬라이더 값. 잡고 있는 동안은 조작기가 여기에 쓴다. */
  slider: number;
  /** 슬라이더를 잡고 있는가 (`heldPath`). */
  held: boolean;

  /** 판 위 자리(원본 px, 경첩에서 판을 따라)와 속력(아래쪽 +, 멈추면 −1). 원본 `sH·sL·vH·vL`. */
  sH: number;
  sL: number;
  vH: number;
  vL: number;

  /** 회차마다 미끄러진 순간의 더미 수. 최근 4 개. 각은 언제나 마찰각이다. */
  records: readonly number[];

  /** 미끄러지는 단계에서 두 상자가 모두 멈췄는가 — 캡션 `cases`. */
  stopped: boolean;
  /** 캡션 `{n}` · `{angle}` 에 끼울 글자. 자릿수는 조각이 정한다. */
  nText: string;
  slipText: string;
}

export function initialState(): AngleOfFrictionState {
  const n = AUTO_SEQ[0];
  return {
    clock: 0,
    cycle: 0,
    phase: 'tilt',
    n,
    userN: null,
    slider: n,
    held: false,
    sH: LAYOUT.heavyS0Px,
    sL: LAYOUT.lightS0Px,
    vH: 0,
    vL: 0,
    records: [],
    stopped: false,
    nText: String(n),
    slipText: THETA_S_DEG.toFixed(1),
  };
}
