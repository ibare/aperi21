// ========================================================================
// vertical-loop — 순수 물리
// ========================================================================
// 길이 단위: 공 중심이 도는 원의 반지름 = 1. 원점은 고리 중심, y 는 위.
//
// 한 순환(6 초)을 표로 미리 적분하고 조각 시계로 보간해 읽는다. 레일 위는 θ 를
// RK4 로, 수직항력이 0 이 되는 스텝에서 정확한 이탈각으로 옮겨 탄 뒤로는 해석해로
// 던져진 운동을 푼다. 원본(tasks/piece-lab/vertical-loop)의 계산을 그대로 옮겼다.
// ========================================================================

import type { VerticalLoopState } from './state';

/** 통과하는 공이 한 바퀴 도는 시간(초). g 를 이것에 맞춰 정한다. */
export const LOOP_PERIOD = 3.0;
/**
 * 바닥 속력 제곱(gR 의 배수).
 *
 * - 통과 공 6gR → 꼭대기 속력 제곱 2gR (최소 gR 보다 크다)
 * - 이탈 공 4gR → cosθ = −2/3 (바닥에서 약 131.8°)에서 수직항력 0
 */
export const V0SQ_PASS = 6;
export const V0SQ_FAIL = 4;
/** 통과 공이 두 바퀴 돌고 제자리 — 이음매 없이 되풀이한다. */
export const CYCLE = 2 * LOOP_PERIOD;
/** 표의 칸 간격(초). */
export const TABLE_DT = 1 / 240;

/** ∫₀^{2π} dθ / √(k−2+2cosθ) — 바닥 속력 제곱 k 인 공이 한 바퀴 도는 데 걸리는 무차원 시간. */
function loopIntegral(k: number): number {
  const n = 20000;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const th = ((i + 0.5) / n) * 2 * Math.PI;
    s += (2 * Math.PI) / n / Math.sqrt(k - 2 + 2 * Math.cos(th));
  }
  return s;
}

/** 중력 가속도(길이 단위/초²). 통과 공 한 바퀴가 `LOOP_PERIOD` 가 되게 정했다. */
export const G = (loopIntegral(V0SQ_PASS) / LOOP_PERIOD) ** 2;

export interface LoopRow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 수직항력(질량당). 레일을 떠나면 0. */
  N: number;
  rail: boolean;
  rest?: boolean;
}

export interface LoopEvent {
  t: number;
  x: number;
  y: number;
}

export interface LoopTable {
  rows: LoopRow[];
  /** 레일을 떠난 순간. 끝까지 붙어 있으면 `null`. */
  sep: LoopEvent | null;
  /** 떨어져 레일에 닿은 순간. */
  impact: LoopEvent | null;
}

/** 한 공의 한 순환을 표로 계산한다. 결정적 — 같은 입력은 언제나 같은 표다. */
export function simulate(v0sq: number): LoopTable {
  const rows: LoopRow[] = [];
  let th = 0;
  let onRail = true;
  let sep: LoopEvent | null = null;
  let impact: LoopEvent | null = null;
  let px = 0;
  let py = 0;
  let pvx = 0;
  let pvy = 0;
  let flightT = 0;
  let left = false;
  const speedAt = (a: number): number => Math.sqrt(Math.max(0, G * (v0sq - 2 * (1 - Math.cos(a)))));
  const normalAt = (a: number): number => G * (v0sq - 2 + 3 * Math.cos(a));
  const nSteps = Math.round(CYCLE / TABLE_DT);
  for (let i = 0; i <= nSteps; i++) {
    const t = i * TABLE_DT;
    if (onRail) {
      const v = speedAt(th);
      const N = normalAt(th);
      rows.push({
        x: Math.sin(th),
        y: -Math.cos(th),
        vx: Math.cos(th) * v,
        vy: Math.sin(th) * v,
        N: Math.max(0, N),
        rail: true,
      });
      const k1 = speedAt(th);
      const k2 = speedAt(th + (k1 * TABLE_DT) / 2);
      const k3 = speedAt(th + (k2 * TABLE_DT) / 2);
      const k4 = speedAt(th + k3 * TABLE_DT);
      const next = th + ((k1 + 2 * k2 + 2 * k3 + k4) * TABLE_DT) / 6;
      if (normalAt(next) <= 0) {
        // 이 사이에서 수직항력이 0 이 된다 → 정확한 이탈각에서 떠난다.
        const thS = Math.acos((2 - v0sq) / 3);
        const vS = speedAt(thS);
        sep = { t: t + TABLE_DT, x: Math.sin(thS), y: -Math.cos(thS) };
        px = sep.x;
        py = sep.y;
        pvx = Math.cos(thS) * vS;
        pvy = Math.sin(thS) * vS;
        flightT = 0;
        onRail = false;
      } else {
        th = next;
      }
    } else if (!impact && sep) {
      rows.push({ x: px, y: py, vx: pvx, vy: pvy, N: 0, rail: false });
      // 던져진 운동은 해석해로 다음 점을 구한다.
      flightT += TABLE_DT;
      const s = rows[Math.round(sep.t / TABLE_DT)];
      const v0x = s ? s.vx : pvx;
      const v0y = s ? s.vy : pvy;
      px = sep.x + v0x * flightT;
      py = sep.y + v0y * flightT - 0.5 * G * flightT * flightT;
      pvx = v0x;
      pvy = v0y - G * flightT;
      const r = Math.hypot(px, py);
      if (r < 0.99) left = true;
      if (left && r >= 1) {
        px /= r;
        py /= r;
        impact = { t: t + TABLE_DT, x: px, y: py };
      }
    } else if (impact) {
      rows.push({ x: impact.x, y: impact.y, vx: 0, vy: 0, N: 0, rail: false, rest: true });
    }
  }
  return { rows, sep, impact };
}

/** 빠르게 들어온 공 — 꼭대기에서도 레일에 눌린 채 계속 돈다. */
export const PASS = simulate(V0SQ_PASS);
/** 조금 느리게 들어온 공 — 꼭대기 전에 레일을 떠나 떨어진다. */
export const FAIL = simulate(V0SQ_FAIL);

function mustEvent(e: LoopEvent | null, what: string): LoopEvent {
  if (!e) throw new Error(`vertical-loop: 느리게 들어온 공의 ${what} 순간이 표에 없다`);
  return e;
}

/** 느린 공이 레일을 떠나는 순간(조각 시계, 초). 시간표 단계 길이가 여기서 나온다. */
export const FAIL_SEP = mustEvent(FAIL.sep, '이탈');
/** 느린 공이 떨어져 레일에 닿는 순간(조각 시계, 초). */
export const FAIL_IMPACT = mustEvent(FAIL.impact, '착지');

/** 표를 주기 안 시각 `tau` 로 읽는다. 구간이 바뀌는 칸 사이는 보간하지 않는다. */
export function sample(table: LoopTable, tau: number): LoopRow {
  const f = tau / TABLE_DT;
  const i = Math.floor(f);
  const u = f - i;
  const last = table.rows.length - 1;
  const a = table.rows[Math.max(0, Math.min(i, last))]!;
  const b = table.rows[Math.max(0, Math.min(i + 1, last))]!;
  if (a.rail !== b.rail || a.rest !== b.rest) return a;
  const L = (p: number, q: number): number => p + (q - p) * u;
  return {
    x: L(a.x, b.x),
    y: L(a.y, b.y),
    vx: L(a.vx, b.vx),
    vy: L(a.vy, b.vy),
    N: L(a.N, b.N),
    rail: a.rail,
    rest: a.rest,
  };
}

/** 쌓는 상태가 없다 — 운동은 표에서 시각으로 읽는다. */
export function step(params: { state: VerticalLoopState }): VerticalLoopState {
  return params.state;
}
