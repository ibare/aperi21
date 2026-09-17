// ========================================================================
// thermal-convection — 순수 계산
// ========================================================================
// 원본 index.html 의 식 · 상수를 그대로 옮겼다.
//
// - 가로 3 · 세로 1 상자, 96 × 32 격자의 온도 T. 바닥 T=1 · 천장 T=0 고정, 옆벽 단열.
// - 속도장은 유선함수에서 유도한 세 대류 롤 + 천천히 흔들리는 두 번째 모드(부력 되먹임 없음).
// - 한 걸음: 흐름 세기가 조작값을 따라감 → 반라그랑주 이류 + 확산(부분 단계 2) →
//   흐름 입자 · 덩어리 RK2 이동 → 덩어리 온도가 주변과 1/초 0.5 로 섞임 → 자취 기록.
//
// 좌표는 원본 좌표(y 위로, 0~3 × 0~1)다. 화면 배치는 scene 이 한다.
// ========================================================================

import type { Vec2 } from '@aperi21/schema';

import { FLOW_CONTROL } from './schema';
import type { ThermalConvectionState } from './state';

// ── 영역과 격자 ─────────────────────────────────────────
export const W = 3;
export const H = 1;
export const NX = 96;
export const NY = 32;
const DX = W / NX;
const DY = H / NY;
/** 열확산 계수. */
const KAPPA = 0.012;
/** 흐름 세기 1 일 때 최대 속력. */
const U0 = 0.8;
/** 한 걸음당 적분 부분 단계. */
const SUB = 2;
export const T_HOT = 1;
export const T_COLD = 0;

/** 흐름 표시 입자 수. */
export const TRACER_COUNT = 90;
/** 덩어리가 주변과 열을 주고받는 빠르기 (1/초). */
const EXCHANGE = 0.5;
/** 자취 길이(걸음 수). */
export const TRAIL_LEN = 110;
/** 덩어리 출발 자리. */
const PARCEL_START: Vec2 = [0.85, 0.15];
/** 흐름 세기가 조작값을 따라가는 빠르기(1/초). */
const FOLLOW = 3;
/** 캡션이 「멎었다」 로 바뀌는 실제 흐름 세기. */
const STOP_BELOW = 0.08;

/** 원본 PieceKit 의 고정 걸음. */
export const DT = 1 / 60;
/** 실시간 한 프레임에 밀린 걸음의 상한 — 탭이 멈췄다 돌아와도 한꺼번에 몰아 걷지 않는다. */
const MAX_SUBSTEPS = 6;
/** 도착한 순간 이미 진행 중이도록 온도장만 미리 적분하는 걸음 수 (0.4 초, 음의 시간). */
const PRE_STEPS = 24;
/** 흐름 입자 배치 난수의 시드 — 원본 촬영 `?seed=1`. */
const SEED = 1;

const idx = (i: number, j: number): number => j * NX + i;

// ── 속도장: 세 개의 대류 롤 + 천천히 흔들리는 두 번째 모드 ──
/** 유선함수에서 유도해 벽을 뚫지 않고 비압축이다. */
export function velocity(amp: number, x: number, y: number, t: number): Vec2 {
  const e = 0.35 * Math.sin(0.5 * t);
  const A = amp * U0;
  const px = Math.PI * x;
  const py = Math.PI * y;
  const qx = (2 * Math.PI * x) / 3;
  const qy = 2 * Math.PI * y;
  return [
    A * (Math.sin(px) * Math.cos(py) + e * 2 * Math.sin(qx) * Math.cos(qy)),
    -A * (Math.cos(px) * Math.sin(py) + e * (2 / 3) * Math.cos(qx) * Math.sin(qy)),
  ];
}

/** 벽 경계를 반영한 온도 읽기 (바닥 · 천장은 고정 온도, 옆벽은 단열). */
function cell(src: ArrayLike<number>, i: number, j: number): number {
  if (i < 0) i = 0;
  else if (i >= NX) i = NX - 1;
  if (j < 0) return 2 * T_HOT - src[idx(i, 0)]!;
  if (j >= NY) return 2 * T_COLD - src[idx(i, NY - 1)]!;
  return src[idx(i, j)]!;
}

export function sample(src: ArrayLike<number>, x: number, y: number): number {
  const fx = x / DX - 0.5;
  const fy = y / DY - 0.5;
  const i0 = Math.floor(fx);
  const j0 = Math.floor(fy);
  const sx = fx - i0;
  const sy = fy - j0;
  const a = cell(src, i0, j0);
  const b = cell(src, i0 + 1, j0);
  const c = cell(src, i0, j0 + 1);
  const d = cell(src, i0 + 1, j0 + 1);
  return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
}

/** 한 부분 단계. `T` 를 제자리에서 바꾼다(`T2` 는 작업 칸). */
function advanceField(T: Float64Array, T2: Float64Array, amp: number, h: number, t: number): void {
  // 1) 흐름이 열을 싣고 간다 — 반라그랑주 이류
  for (let j = 0; j < NY; j++) {
    const y = (j + 0.5) * DY;
    for (let i = 0; i < NX; i++) {
      const x = (i + 0.5) * DX;
      const v1 = velocity(amp, x, y, t);
      const v2 = velocity(amp, x - 0.5 * h * v1[0], y - 0.5 * h * v1[1], t);
      let xb = x - h * v2[0];
      let yb = y - h * v2[1];
      if (xb < 0) xb = 0;
      else if (xb > W) xb = W;
      if (yb < 0) yb = 0;
      else if (yb > H) yb = H;
      T2[idx(i, j)] = sample(T, xb, yb);
    }
  }
  // 2) 제자리에서 번진다 — 확산
  const rx = (KAPPA * h) / (DX * DX);
  const ry = (KAPPA * h) / (DY * DY);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const c = T2[idx(i, j)]!;
      const lap =
        rx * (cell(T2, i - 1, j) - 2 * c + cell(T2, i + 1, j)) +
        ry * (cell(T2, i, j - 1) - 2 * c + cell(T2, i, j + 1));
      T[idx(i, j)] = c + lap;
    }
  }
}

function moveParticle(amp: number, p: Vec2, h: number, t: number): Vec2 {
  const v1 = velocity(amp, p[0], p[1], t);
  const v2 = velocity(amp, p[0] + 0.5 * h * v1[0], p[1] + 0.5 * h * v1[1], t);
  let x = p[0] + h * v2[0];
  let y = p[1] + h * v2[1];
  if (x < 0.01) x = 0.01;
  else if (x > W - 0.01) x = W - 0.01;
  if (y < 0.01) y = 0.01;
  else if (y > H - 0.01) y = H - 0.01;
  return [x, y];
}

/** 원본 PieceKit 의 시드 난수(mulberry32). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 첫 상태. 전도만 있을 때의 층 모양 분포에서 **온도장만** 0.4 초(음의 시간)를 미리 적분하고,
 * 덩어리 온도를 그 자리 온도로 둔다 — 원본 그대로다.
 */
export function freshState(): ThermalConvectionState {
  const T = new Float64Array(NX * NY);
  const T2 = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    const y = (j + 0.5) * DY;
    for (let i = 0; i < NX; i++) T[idx(i, j)] = T_HOT + ((T_COLD - T_HOT) * y) / H;
  }
  const rand = mulberry32(SEED);
  const tracers: Vec2[] = [];
  for (let k = 0; k < TRACER_COUNT; k++) {
    const x = 0.03 + rand() * (W - 0.06);
    const y = 0.03 + rand() * (H - 0.06);
    tracers.push([x, y]);
  }
  const amp = FLOW_CONTROL.default;
  for (let s = 0; s < PRE_STEPS; s++) {
    const tp = (s - PRE_STEPS) / 60;
    for (let k = 0; k < SUB; k++) advanceField(T, T2, amp, DT / SUB, tp);
  }
  return {
    field: Array.from(T),
    flow: FLOW_CONTROL.default,
    amp,
    t: 0,
    acc: 0,
    tracers,
    parcel: PARCEL_START,
    parcelTemp: sample(T, PARCEL_START[0], PARCEL_START[1]),
    trail: [],
    stopped: false,
  };
}

/** 원본 `PieceKit.loop` 의 `step(dt, t)` 한 번. */
function simStep(s: ThermalConvectionState, T: Float64Array, T2: Float64Array, target: number, h: number): ThermalConvectionState {
  const t = s.t;
  let amp = s.amp + (target - s.amp) * Math.min(1, h * FOLLOW);
  if (Math.abs(amp) < 1e-4) amp = 0;
  for (let k = 0; k < SUB; k++) advanceField(T, T2, amp, h / SUB, t);
  const tracers = s.tracers.map((p) => moveParticle(amp, p, h, t));
  const parcel = moveParticle(amp, s.parcel, h, t);
  // 덩어리는 제 열을 지닌 채 움직이고, 주변과는 천천히만 섞인다
  const parcelTemp = s.parcelTemp + (sample(T, parcel[0], parcel[1]) - s.parcelTemp) * EXCHANGE * h;
  const trail = s.trail.length >= TRAIL_LEN ? s.trail.slice(s.trail.length - TRAIL_LEN + 1) : s.trail.slice();
  trail.push(parcel);
  return { ...s, amp, t: t + h, tracers, parcel, parcelTemp, trail };
}

/** 슬라이더 값을 범위로 자른다. */
function clampFlow(v: number): number {
  if (!Number.isFinite(v)) return FLOW_CONTROL.default;
  return Math.max(FLOW_CONTROL.min, Math.min(FLOW_CONTROL.max, v));
}

/**
 * 한 걸음. 실시간 dt 는 가변이라 고정 걸음(1/60 초)으로 나눠 걷는다 — 원본 `PieceKit.loop` 과 같다.
 */
export function step(params: { state: ThermalConvectionState; dt: number }): ThermalConvectionState {
  const { dt } = params;
  let state = params.state;
  const flow = clampFlow(state.flow);

  let acc = state.acc + dt;
  let n = 0;
  // 1/60 을 더해 온 부동소수 오차로 한 걸음을 놓치지 않게 아주 작은 여유를 둔다.
  while (acc >= DT - 1e-9 && n < MAX_SUBSTEPS) {
    acc -= DT;
    n++;
  }
  if (n === MAX_SUBSTEPS) acc = Math.min(acc, DT);
  if (n === 0) return { ...state, flow, acc };

  const T = Float64Array.from(state.field);
  const T2 = new Float64Array(NX * NY);
  for (let i = 0; i < n; i++) state = simStep(state, T, T2, flow, DT);
  return {
    ...state,
    field: Array.from(T),
    flow,
    acc: Math.max(0, acc),
    stopped: state.amp < STOP_BELOW,
  };
}
