// ========================================================================
// youngs-double-slit — 순수 계산
// ========================================================================
// 원본 index.html 의 식 그대로다. 좌표는 원본 논리 px(y 아래)로 계산하고, 월드(y 위)로 옮기는 것은
// scene 이 한다.
//
// - 슬릿 하나를 점광원 셋으로 본다(폭이 파장보다 좁아 넓게 퍼진다). 위 슬릿은 늘 열려 있다.
// - 아래 슬릿 물결은 열린 창(on/off 시각)마다 앞머리 · 꼬리가 전파 속력으로 번진다.
// - 스크린 세기는 복소 진폭 합의 제곱. 격자 거리 · 진폭 · 스크린 행 진폭은 선언 상수에서 한 번 만든다.
// ========================================================================

import {
  ARRIVED,
  ARRIVE_ANY,
  BARRIER_T,
  BARRIER_X,
  C,
  CELL,
  DARK_RATIO,
  FRONT_W,
  H,
  LAMBDA,
  SCREEN_X,
  SLIT_GAP,
  SLIT_W,
  youngsDoubleSlitSchema,
} from './schema';
import type { SlitWindow, YoungsDoubleSlitState } from './state';

const K = (2 * Math.PI) / LAMBDA;
const OMEGA = K * C;
const CY = H / 2;
/** 위 슬릿(늘 열림) · 아래 슬릿(열고 닫음) 중심 y. */
export const SLIT_A_Y = CY - SLIT_GAP / 2;
export const SLIT_B_Y = CY + SLIT_GAP / 2;

const OFFS = [-SLIT_W / 2, 0, SLIT_W / 2] as const;
const SOURCES: readonly { slit: 'A' | 'B'; x: number; y: number }[] = [
  ...OFFS.map((o) => ({ slit: 'A' as const, x: BARRIER_X, y: SLIT_A_Y + o })),
  ...OFFS.map((o) => ({ slit: 'B' as const, x: BARRIER_X, y: SLIT_B_Y + o })),
];

function ampAt(r: number): number {
  return Math.sqrt((LAMBDA * 1.5) / Math.max(r, LAMBDA * 0.5)) / OFFS.length;
}

// ------------------------------------------------------------------------
// 창 — 아래 슬릿이 열린 구간
// ------------------------------------------------------------------------

/** 자동 주기의 창 — 지금 주기 하나만(원본 `windowsAt`). */
export function autoWindows(clock: number, openStart: number, openEnd: number, period: number): SlitWindow[] {
  const base = Math.floor(clock / period) * period;
  return [{ on: base + openStart, off: base + openEnd }];
}

export function shutterOpen(t: number, windows: readonly SlitWindow[]): boolean {
  return windows.some((w) => t >= w.on && (w.off === null || t < w.off));
}

function smooth(x: number): number {
  const u = Math.min(1, Math.max(0, x / FRONT_W + 0.5));
  return u * u * (3 - 2 * u);
}

/** 아래 슬릿에서 거리 r 인 곳에 새 물결이 와 있는 정도 (0~1). */
function actB(t: number, r: number, windows: readonly SlitWindow[]): number {
  let a = 0;
  for (const w of windows) {
    if (t < w.on) continue;
    const head = smooth(C * (t - w.on) - r);
    const tail = w.off === null || t < w.off ? 0 : smooth(C * (t - w.off) - r);
    a += head * (1 - tail);
  }
  return Math.min(1, a);
}

// ------------------------------------------------------------------------
// 물결장 격자 (2 px 한 칸)
// ------------------------------------------------------------------------

/** 격자 가로 · 세로 칸 수 — 가림벽 왼쪽 끝(0)부터 스크린 왼쪽 가장자리까지. */
export const FIELD_COLS = Math.ceil(SCREEN_X / CELL);
export const FIELD_ROWS = Math.ceil(H / CELL);
const N = FIELD_COLS * FIELD_ROWS;

const CELL_R = SOURCES.map(() => new Float32Array(N));
const CELL_AMP = SOURCES.map(() => new Float32Array(N));
const IS_RIGHT = new Uint8Array(N);
for (let j = 0; j < FIELD_ROWS; j++) {
  for (let i = 0; i < FIELD_COLS; i++) {
    const idx = j * FIELD_COLS + i;
    const x = (i + 0.5) * CELL;
    const y = (j + 0.5) * CELL;
    IS_RIGHT[idx] = x > BARRIER_X + BARRIER_T / 2 ? 1 : 0;
    SOURCES.forEach((s, si) => {
      const r = Math.hypot(x - s.x, y - s.y);
      CELL_R[si]![idx] = r;
      CELL_AMP[si]![idx] = ampAt(r);
    });
  }
}

/**
 * 물결장 칸 값 −1~1 (행 우선, 첫 행이 위). 벽 왼쪽은 평면파, 오른쪽은 점광원 여섯의 합.
 * 원본 `drawField` 의 `tanh(u · 1.3)` 까지 그대로다 — 값→색은 scene 의 선언이 정한다.
 */
export function fieldValues(t: number, windows: readonly SlitWindow[]): number[] {
  const out = new Array<number>(N);
  const wt = OMEGA * t;
  const kxb = K * BARRIER_X;
  for (let idx = 0; idx < N; idx++) {
    let u: number;
    if (!IS_RIGHT[idx]) {
      const x = ((idx % FIELD_COLS) + 0.5) * CELL;
      u = 0.55 * Math.cos(K * x - wt);
    } else {
      u = 0;
      for (let si = 0; si < 6; si++) {
        const r = CELL_R[si]![idx]!;
        const a = si < 3 ? 1 : actB(t, r, windows);
        if (a <= 0) continue;
        u += a * CELL_AMP[si]![idx]! * Math.cos(kxb + K * r - wt);
      }
      u *= 1.1;
    }
    out[idx] = Math.tanh(u * 1.3);
  }
  return out;
}

// ------------------------------------------------------------------------
// 스크린 — 행마다 복소 진폭
// ------------------------------------------------------------------------

const RE_A = new Float64Array(H);
const IM_A = new Float64Array(H);
const R_B: number[][] = [];
const AMP_B: number[][] = [];
const PH_B: number[][] = [];
for (let y = 0; y < H; y++) {
  let ra = 0;
  let ia = 0;
  const rs: number[] = [];
  const as: number[] = [];
  const ps: number[] = [];
  for (const s of SOURCES) {
    const r = Math.hypot(SCREEN_X - s.x, y + 0.5 - s.y);
    const a = ampAt(r);
    if (s.slit === 'A') {
      ra += a * Math.cos(K * r);
      ia += a * Math.sin(K * r);
    } else {
      rs.push(r);
      as.push(a);
      ps.push(K * r);
    }
  }
  RE_A[y] = ra;
  IM_A[y] = ia;
  R_B.push(rs);
  AMP_B.push(as);
  PH_B.push(ps);
}

/** 슬릿 하나일 때 세기(행마다). */
export const GHOST: readonly number[] = Array.from({ length: H }, (_, y) => RE_A[y]! ** 2 + IM_A[y]! ** 2);
/** 두 슬릿이 오래 열려 있을 때 세기(행마다). */
const STEADY_TWO: readonly number[] = Array.from({ length: H }, (_, y) => {
  let rb = 0;
  let ib = 0;
  for (let k = 0; k < 3; k++) {
    rb += AMP_B[y]![k]! * Math.cos(PH_B[y]![k]!);
    ib += AMP_B[y]![k]! * Math.sin(PH_B[y]![k]!);
  }
  return (RE_A[y]! + rb) ** 2 + (IM_A[y]! + ib) ** 2;
});
/** 세기 척도 — 두 슬릿 정상 상태의 최댓값. */
export const IMAX = Math.max(...STEADY_TWO);

/** 꺼진 줄 — 두 슬릿일 때 극소이면서 슬릿 하나일 때보다 훨씬 어두운 행(원본 px y, 행 가운데). */
export const DARK_ROWS: readonly number[] = (() => {
  const rows: number[] = [];
  for (let y = 2; y < H - 2; y++) {
    const v = STEADY_TWO[y]!;
    if (v <= STEADY_TWO[y - 1]! && v < STEADY_TWO[y + 1]! && v < DARK_RATIO * GHOST[y]!) rows.push(y + 0.5);
  }
  return rows;
})();

export interface ScreenFrame {
  /** 지금 스크린 세기(행마다). */
  intensity: number[];
  /** 아래 슬릿 물결이 스크린에 닿은 정도의 최솟값 · 최댓값. */
  arriveMin: number;
  arriveMax: number;
}

export function screenFrame(t: number, windows: readonly SlitWindow[]): ScreenFrame {
  const intensity = new Array<number>(H);
  let arriveMin = 1;
  let arriveMax = 0;
  for (let y = 0; y < H; y++) {
    let re = RE_A[y]!;
    let im = IM_A[y]!;
    let actSum = 0;
    for (let k = 0; k < 3; k++) {
      const a = actB(t, R_B[y]![k]!, windows);
      actSum += a;
      re += a * AMP_B[y]![k]! * Math.cos(PH_B[y]![k]!);
      im += a * AMP_B[y]![k]! * Math.sin(PH_B[y]![k]!);
    }
    const act = actSum / 3;
    arriveMin = Math.min(arriveMin, act);
    arriveMax = Math.max(arriveMax, act);
    intensity[y] = re * re + im * im;
  }
  return { intensity, arriveMin, arriveMax };
}

// ------------------------------------------------------------------------
// 판정 — 캡션과 꺼진 줄 눈금이 같은 값에서 나온다
// ------------------------------------------------------------------------

export type SlitPhase = 'single' | 'traveling' | 'arriving' | 'dark' | 'leaving';

/** 원본 `stateOf` 그대로. */
export function phaseOf(open: boolean, f: Pick<ScreenFrame, 'arriveMin' | 'arriveMax'>): SlitPhase {
  if (open) {
    if (f.arriveMax < ARRIVE_ANY) return 'traveling';
    if (f.arriveMin < ARRIVED) return 'arriving';
    return 'dark';
  }
  if (f.arriveMax >= ARRIVE_ANY) return 'leaving';
  return 'single';
}

// ------------------------------------------------------------------------
// 한 걸음 — 단추 인계 · 캡션 판정
// ------------------------------------------------------------------------

/**
 * 선언된 시간표에서 자동 창을 다시 센다 — `step` 은 `TimelineFrame` 을 받지 못한다(NOTES 「어휘 부족」).
 * 열림은 `open` 단계의 시작, 닫힘은 그 끝이다.
 */
function declaredWindows(clock: number): SlitWindow[] {
  const phases = youngsDoubleSlitSchema.timeline!.phases;
  let start = 0;
  let openStart = 0;
  let openEnd = 0;
  for (const p of phases) {
    if (p.id === 'open') {
      openStart = start;
      openEnd = start + p.duration;
    }
    start += p.duration;
  }
  return autoWindows(clock, openStart, openEnd, start);
}

/**
 * 한 걸음. 손대기 전에는 자동 창으로 캡션 · 단추 문안을 화면에 맞추고, 단추를 누르는 순간 자동 주기를 끊고
 * 지금까지의 창을 넘겨받아 그 시각부터 아래 슬릿을 열거나 닫는다(원본 단추 처리 그대로).
 */
export function step(params: { state: YoungsDoubleSlitState; dt: number }): YoungsDoubleSlitState {
  const s = params.state;
  const clock = s.clock + params.dt;
  let manual = s.manual;
  let windows: readonly SlitWindow[] = manual ? s.windows : declaredWindows(clock);

  if (s.togglePressed) {
    let next: SlitWindow[];
    if (!manual) {
      next = windows.filter((w) => w.on <= clock).map((w) => ({ on: w.on, off: w.off !== null && w.off > clock ? null : w.off }));
      manual = true;
    } else {
      next = windows.map((w) => ({ ...w }));
    }
    if (shutterOpen(clock, next)) {
      next = next.map((w) => (w.off === null ? { on: w.on, off: clock } : w));
    } else {
      next.push({ on: clock, off: null });
    }
    windows = next;
  }

  const open = shutterOpen(clock, windows);
  const phase = phaseOf(open, screenFrame(clock, windows));
  return {
    clock,
    manual,
    windows: manual ? windows : [],
    togglePressed: false,
    showOpen: !open,
    showClose: open,
    capSingle: phase === 'single',
    capTraveling: phase === 'traveling',
    capArriving: phase === 'arriving',
    capDark: phase === 'dark',
    capLeaving: phase === 'leaving',
  };
}
