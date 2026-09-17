/**
 * 원본처럼 **누적 상태**로 움직인다. 주기 위치 `u` 는 τ 단위라 저항 선택에 따라 흐르는
 * 빠르기가 달라지고(시간표로 적을 수 없다 — schema.ts `preroll` 머리말), 도선 위 전하 점의
 * 이동 거리 `flow` 는 전류의 적분이다.
 *
 * 축전기 전압 · 궤적 · τ 막대는 쌓지 않는다. 주기 첫머리 전압 `v0` 와 `u` 의 해석해라
 * 원본이 프레임마다 쌓던 것과 같은 값이 나온다 (physics.ts `vAt`).
 */
import { DEFAULT_R } from './schema';
import { derive } from './physics';

export interface RcCircuitState {
  /** 고른 저항 단(0 작게 · 1 기본 · 2 크게). 칩 줄이 쓴다. */
  r: number;
  /** 지금 흘리고 있는 저항 단. `r` 과 다르면 step 이 충전부터 다시 시작한다. */
  shownR: number;
  /** 칩을 누르고 있는 동안 true. 러너가 `heldPath` 로 적는다. */
  held: boolean;
  /** 한 주기 안의 위치(τ 단위, 0 ~ 10). */
  u: number;
  /** 이번 주기 첫머리의 축전기 전압(전지 전압 = 1). 첫 주기는 0. */
  v0: number;
  /** 도선 위 전하 점의 누적 이동 거리(px, 점 간격으로 나눈 나머지). */
  flow: number;

  // ---- 위에서 계산해 두는 값 (캡션 슬롯 · readout 이 읽는다) ----
  /** 충전 구간(u < 5τ). */
  charging: boolean;
  /** 방전 구간. */
  discharging: boolean;
  /** τ 초 값 글자. 선언된 τ 의 자릿수 그대로. */
  tauText: string;
}

export function initialState(): RcCircuitState {
  return derive({ r: DEFAULT_R, shownR: DEFAULT_R, held: false, u: 0, v0: 0, flow: 0 });
}

