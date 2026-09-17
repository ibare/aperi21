// ========================================================================
// normal-modes — 순수 물리
// ========================================================================
// 양 끝이 고정된 줄에 구슬 다섯 알. 사슬을 속도 베를레로 적분하고(dt = 1/60),
// 매 걸음 변위를 모드 모양에 투영해 모드 좌표 q_n 과 진폭을 얻는다. 모드 줄의
// 그림은 연출한 곡선이 아니라 위 사슬에서 나온 값이다.
//
// 상태를 쌓는 조각이다 — 기록 선(지난 4 초)과 끌어 놓은 뒤의 흔들림은 시각의
// 함수가 아니다. 그래서 `step` 이 일을 하고, 도착 순간의 앞당김은 `schema.preroll`.
// ========================================================================

import {
  ACTIVE_EPS,
  DISP_PX,
  HIST,
  HOLD_LIMIT,
  LAYOUT,
  N,
  TICK,
  W0,
} from './schema';
import type { BeadGrab, CaptionFlags, NormalModesState } from './state';

/** 모드 n 의 각진동수 ω_n = 2 W0 sin(nπ / 2(N+1)). */
export const OMEGA: readonly number[] = Array.from({ length: N }, (_, i) =>
  2 * W0 * Math.sin(((i + 1) * Math.PI) / (2 * (N + 1))),
);

/** 모드 n 의 모양 s_n(j) = √(2/(N+1)) sin(nπj/(N+1)). `SHAPE[n][j]`. */
export const SHAPE: readonly (readonly number[])[] = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, k) =>
    Math.sqrt(2 / (N + 1)) * Math.sin(((i + 1) * Math.PI * (k + 1)) / (N + 1)),
  ),
);

/** 부동소수 누적으로 한 걸음을 놓치지 않게 두는 여유. */
const TICK_EPS = 1e-9;

/** 손잡이 경로 이름. */
export function grabKey(j: number): string {
  return `b${j}`;
}

/** 구슬 변위 → 월드 세로 자리. */
export function beadWorldY(d: number): number {
  return LAYOUT.mainY + d * DISP_PX;
}

/** 캡션 판정 불리언. 붙잡은 동안이 먼저다. */
export function captionFlags(held: boolean, active: number): CaptionFlags {
  return {
    held,
    still: !held && active === 0,
    modes1: !held && active === 1,
    modes2: !held && active === 2,
    modes3: !held && active === 3,
    modes4: !held && active === 4,
  };
}

/** 변위 · 속도를 모드 모양에 투영한다. */
export function project(
  y: readonly number[],
  v: readonly number[],
): { q: number[]; amp: number[]; active: number } {
  const q: number[] = [];
  const amp: number[] = [];
  let active = 0;
  for (let n = 0; n < N; n++) {
    let a = 0;
    let b = 0;
    for (let j = 0; j < N; j++) {
      a += SHAPE[n]![j]! * y[j]!;
      b += SHAPE[n]![j]! * v[j]!;
    }
    q.push(a);
    const A = Math.hypot(a, b / OMEGA[n]!);
    amp.push(A);
    if (A > ACTIVE_EPS) active++;
  }
  return { q, amp, active };
}

function accel(y: readonly number[], out: number[]): void {
  for (let j = 0; j < N; j++) {
    const l = j > 0 ? y[j - 1]! : 0;
    const r = j < N - 1 ? y[j + 1]! : 0;
    out[j] = W0 * W0 * (l - 2 * y[j]! + r);
  }
}

/** 잡힌 구슬 번호. 없으면 -1. */
function heldBead(grab: Readonly<Record<string, BeadGrab>>): number {
  for (let j = 0; j < N; j++) if (grab[grabKey(j)]?.held) return j;
  return -1;
}

export function step(params: { state: NormalModesState; dt: number }): NormalModesState {
  const prev = params.state;
  let acc = prev.acc + params.dt;
  if (acc < TICK - TICK_EPS) return { ...prev, acc };

  const y = prev.y.slice();
  const v = prev.v.slice();
  const hist = prev.hist.slice();
  let head = prev.head;
  const a = new Array<number>(N).fill(0);
  const held = heldBead(prev.grab);
  let q: number[] = [];
  let amp: number[] = [];
  let active = 0;

  while (acc >= TICK - TICK_EPS) {
    if (held >= 0) {
      // 붙잡은 동안 — 그 구슬만 끈 자리에, 나머지는 멈춘 0.
      const pos = prev.grab[grabKey(held)]!.pos;
      const hy = Math.max(-HOLD_LIMIT, Math.min(HOLD_LIMIT, (pos[1] - LAYOUT.mainY) / DISP_PX));
      for (let j = 0; j < N; j++) {
        y[j] = j === held ? hy : 0;
        v[j] = 0;
      }
    } else {
      accel(y, a);
      for (let j = 0; j < N; j++) {
        v[j] = v[j]! + 0.5 * TICK * a[j]!;
        y[j] = y[j]! + TICK * v[j]!;
      }
      accel(y, a);
      for (let j = 0; j < N; j++) v[j] = v[j]! + 0.5 * TICK * a[j]!;
    }
    ({ q, amp, active } = project(y, v));
    for (let n = 0; n < N; n++) hist[n * HIST + head] = q[n]!;
    head = (head + 1) % HIST;
    acc -= TICK;
  }

  // 손잡이 — 잡힌 것은 러너가 쓴 자리를 두고, 놓인 것은 구슬을 따라간다.
  const grab: Record<string, BeadGrab> = {};
  for (let j = 0; j < N; j++) {
    const g = prev.grab[grabKey(j)]!;
    grab[grabKey(j)] = j === held ? g : { pos: [LAYOUT.bx[j]!, beadWorldY(y[j]!)], held: g.held };
  }

  return {
    y,
    v,
    q,
    amp,
    hist,
    head,
    acc: Math.max(0, acc),
    grab,
    caption: captionFlags(held >= 0, active),
  };
}
