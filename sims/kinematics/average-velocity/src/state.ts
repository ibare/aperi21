// ========================================================================
// average-velocity — 상태
// ========================================================================
// 그림은 전부 시각의 함수다 — scene 이 `params.timeline` 에서 구간을 읽는다.
//
// 그런데 캡션 슬롯의 `vars` 는 **state 경로**만 가리킬 수 있다. 그래서 캡션에 들어갈
// 수(구간 시각 · 위치 변화 · 시간 · 평균 속도)만 `step` 이 자기 시계로 계산해 여기에
// 둔다 (NOTES 「어휘 부족」).
// ========================================================================

import { readoutAt } from './physics';

/** 캡션에 끼울 수. 자릿수를 정한 문자열이다 — 단위·낱말은 문안 틀에 있다. */
export interface IntervalReadout {
  /** 구간 시작 시각(초). */
  from: string;
  /** 구간 끝 시각(초). */
  to: string;
  /** 위치 변화(m). */
  dx: string;
  /** 시간(초). */
  dt: string;
  /** 평균 속도(m/s). */
  v: string;
}

export interface AverageVelocityState {
  /**
   * 조각 시계(초). `preroll` 이 굴린 만큼에서 시작해 걸음마다 쌓인다 — 러너가 시계를
   * `startAt` 으로 맞추므로 scene 이 받는 `timeline.t` 와 같은 값이다.
   */
  t: number;
  readout: IntervalReadout;
}

export function initialState(): AverageVelocityState {
  return { t: 0, readout: readoutAt(0) };
}
