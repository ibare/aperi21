// ========================================================================
// eddy-current — 순수 물리
// ========================================================================
// 플라스틱 관: 아무것도 막지 않는다 — 자유 낙하 y = ½gt², v = gt.
//
// 구리 관: 자석이 움직이면 관 벽의 자기 선속이 바뀌어 맴돌이 전류가 돌고, 그 전류가
// 움직임을 막는 힘 F = k·v 를 만든다. 무게와 같아지는 속력 v_t = mg/k 가 종단 속력이고
//   v(t) = v_t (1 − e^(−t/τ)),   y(t) = v_t (t − τ(1 − e^(−t/τ))),   τ = v_t / g
// 다. 막는 힘은 F/mg = v/v_t — 종단 속력에서 무게와 같다.
//
// 모든 것이 놓은 뒤 흐른 시간의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { DROP, FORCE_SCALE, GRAVITY, STROBE_DT, TERMINAL_SPEED } from './schema';
import type { EddyCurrentState } from './state';

export interface EddyCurrentConstants {
  gravity: number;
  terminalSpeed: number;
  strobeDt: number;
  forceScale: number;
}

export function readConstants(stage: StageDef): EddyCurrentConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravity: c.gravity ?? GRAVITY,
    terminalSpeed: c.terminalSpeed ?? TERMINAL_SPEED,
    strobeDt: c.strobeDt ?? STROBE_DT,
    forceScale: c.forceScale ?? FORCE_SCALE,
  };
}

/** 관 재료. 구리만 맴돌이 전류가 돈다. */
export type Tube = 'plastic' | 'copper';

/** 놓은 뒤 τ 초에 떨어진 거리와 빠르기(바닥에 닿기 전). */
function freeDrop(tau: number, tube: Tube, c: EddyCurrentConstants): { fallen: number; speed: number } {
  if (tube === 'plastic') {
    return { fallen: 0.5 * c.gravity * tau * tau, speed: c.gravity * tau };
  }
  const vt = c.terminalSpeed;
  const relax = vt / c.gravity;
  const e = Math.exp(-tau / relax);
  return { fallen: vt * (tau - relax * (1 - e)), speed: vt * (1 - e) };
}

/**
 * 놓은 뒤 τ 초에 자석이 떨어진 거리(0 ~ DROP)와 빠르기. 바닥에 닿으면 멈춘다.
 * 놓기 전(τ ≤ 0)은 제자리.
 */
export function dropAfter(
  tau: number,
  tube: Tube,
  c: EddyCurrentConstants,
): { fallen: number; speed: number; landed: boolean } {
  if (tau <= 0) return { fallen: 0, speed: 0, landed: false };
  const d = freeDrop(tau, tube, c);
  if (d.fallen >= DROP) return { fallen: DROP, speed: 0, landed: true };
  return { fallen: d.fallen, speed: d.speed, landed: false };
}

/**
 * 스트로보 눈금 — 놓은 순간부터 `strobeDt` 마다 자석이 있던 떨어진 거리. 지금까지
 * 지난 눈금만, 바닥에 닿기 전 것만 준다. 같은 시각은 언제나 같은 목록이다.
 */
export function strobeMarks(tau: number, tube: Tube, c: EddyCurrentConstants): number[] {
  if (tau < 0) return [];
  const count = Math.floor(tau / c.strobeDt + 1e-9);
  const out: number[] = [];
  for (let k = 0; k <= count; k++) {
    const d = dropAfter(k * c.strobeDt, tube, c);
    if (d.landed) break;
    out.push(d.fallen);
  }
  return out;
}

/** 막는 힘 ÷ 무게 = v / v_t. 플라스틱 관은 0. */
export function brakeRatio(speed: number, tube: Tube, c: EddyCurrentConstants): number {
  if (tube === 'plastic') return 0;
  return Math.min(1, speed / c.terminalSpeed);
}

/** 이번 주기에서 놓은 뒤 흐른 시간(초). 놓기 전이면 음수. */
export function sinceRelease(tl: TimelineFrame): number {
  return tl.u - tl.start('fall');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EddyCurrentState }): EddyCurrentState {
  return params.state;
}
