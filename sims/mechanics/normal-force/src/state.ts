// ========================================================================
// normal-force — 런타임 상태
// ========================================================================
// 접촉 여부 · 뜬 높이 · 속도는 막대 힘을 **누적 적분**한 결과라 `step` 이 쌓는다.
//
// `t` 는 조각 시계의 사본이다. `step` 은 TimelineFrame 을 받지 못해 지금 막대 힘을
// 알려면 제 시계가 필요하다 (NOTES 「어휘 부족」). 시계를 앞당기지 않고 재생 속도도
// 바꾸지 않으므로 엔진 시계와 같은 값으로 흐른다.
// ========================================================================

import { settle } from './physics';

export interface NormalForceState {
  /** 조각 시계(초). */
  t: number;
  /** 바닥에 닿아 있는가. */
  contact: boolean;
  /** 바닥에서 뜬 높이(m). */
  h: number;
  /** 위로 가는 속도(m/s). */
  v: number;
  /** 막대 힘(N, 위가 +). */
  F: number;
  /** 수직항력(N). */
  N: number;
  /** 화면에 쓰는 막대 힘 — 정수로 반올림. */
  Fd: number;
  /** 화면에 쓰는 수직항력 — `Fd` 에서 유도해 세 숫자의 합이 어긋나지 않는다. */
  Nd: number;
  /** 캡션 조건 — 뜬 채 당김이 무게 이상. */
  floating: boolean;
  /** 캡션 조건 — 뜬 채 내려오는 중. */
  falling: boolean;
  /** 캡션 조건 — 닿아 있지만 표시한 수직항력이 0. */
  balanced: boolean;
  /** 캡션 조건 — 표시한 막대 힘이 당김. */
  pulling: boolean;
  /** 캡션 조건 — 표시한 막대 힘이 누름. */
  pressing: boolean;
}

/** 원본처럼 상자가 바닥에 닿은 채, 막대가 첫 단계의 시작 힘으로 당기는 중에 출발한다. */
export function initialState(params?: {
  stage?: { constants?: Record<string, number> };
}): NormalForceState {
  return settle(
    {
      t: 0,
      contact: true,
      h: 0,
      v: 0,
      F: 0,
      N: 0,
      Fd: 0,
      Nd: 0,
      floating: false,
      falling: false,
      balanced: false,
      pulling: false,
      pressing: false,
    },
    params?.stage?.constants,
  );
}
