// ========================================================================
// apparent-brightness — 순수 물리
// ========================================================================
// 모든 것이 조각 시계 `t` 의 함수다. 묶음은 거리 1당 1초로 나아가므로 **시각이
// 곧 거리**이고, 지금 살아 있는 묶음은 방출 번호를 floor 로 역산해 찾는다.
// ========================================================================

import { ARRIVAL_TAU, DEPART_TAU, DMAX, FADE_FROM, FADE_IN, PERIOD } from './schema';
import type { ApparentBrightnessState } from './state';

/**
 * 통과 사건이 `t` 와 정확히 겹칠 때의 여유.
 *
 * 시계는 1/60 씩 더해 오므로 3 초가 2.9999999999999996 으로 도착한다. 여유가
 * 없으면 **빛이 칸에 닿은 바로 그 화면에서** 캡션과 테두리 섬광이 한 박자
 * 뒤처진다. 결정타 시각이 정확히 그 경계라 원본이 실제로 겪은 것이다.
 */
const EPS = 1e-6;

/** 방출 번호 k 의 묶음이 별을 떠나는 시각. */
export function emitTime(k: number): number {
  return k * PERIOD;
}

/** 지금까지 떠난 묶음 중 가장 최근 것의 번호. */
export function newestIndex(t: number): number {
  return Math.floor(t / PERIOD + EPS);
}

/** 지금 살아 있는 묶음 — 번호와 별에서의 거리. */
export interface Shell {
  /** 방출 번호. 묶음마다 id 가 흔들리지 않게 하는 이름이기도 하다. */
  readonly k: number;
  /** 별에서의 거리(배수). 거리 1당 1초. */
  readonly d: number;
}

export function liveShells(t: number): Shell[] {
  const out: Shell[] = [];
  let k = newestIndex(t) + 1;
  for (let m = 0; m < 4; m++, k--) {
    let d = t - emitTime(k);
    // 아직 떠나기 직전의 묶음이 부동소수 오차로 음수가 되는 것만 0 으로 당긴다.
    if (d < 0 && d > -1e-4) d = 0;
    if (d >= 0 && d <= DMAX) out.push({ k, d });
  }
  return out;
}

/** 거리 D 의 칸을 빛이 **가장 최근에** 통과한 시각. 아직이면 음수. */
export function lastCross(t: number, distance: number): number {
  return emitTime(Math.floor((t - distance) / PERIOD + EPS)) + distance;
}

/**
 * 칸에 빛이 닿은 직후의 짧은 강조. 1 에서 시작해 지수로 잦아든다.
 *
 * 사건 시각에서 경과를 역산하는 꼴이라 상태를 쌓지 않는다.
 */
export function arrivalGlow(t: number, distance: number): number {
  return Math.exp(-Math.max(0, t - lastCross(t, distance)) / ARRIVAL_TAU);
}

/** 묶음이 막 떠난 직후 별의 번짐이 커지는 정도. */
export function departGlow(t: number): number {
  return Math.exp(-Math.max(0, t - emitTime(newestIndex(t))) / DEPART_TAU);
}

/** 묶음의 짙기 — 태어난 직후 짙어지고, 세 번째 칸을 지나면 스러진다. */
export function fade(d: number): number {
  const rise = Math.min(1, d / FADE_IN);
  const fall = Math.max(0, Math.min(1, (DMAX - d) / (DMAX - FADE_FROM)));
  return rise * fall;
}

/** 쌓는 상태가 없다 — 묶음 · 칸 · 캡션이 모두 시각의 함수다. */
export function step(params: { state: ApparentBrightnessState }): ApparentBrightnessState {
  return params.state;
}
