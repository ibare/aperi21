// ========================================================================
// drag-in-fluid — 순수 물리
// ========================================================================
// 한 레인의 속도장 = 고른 흐름 + 몸이 비껴 내는 흐름(퍼텐셜) + 뒤에서 떨어진 소용돌이들.
//
// - 원기둥: 이중극 w = U(1 − R²/z²).
// - 유선형: 주코프스키 대칭 단면. ζ 평면의 원(중심 −aε, 반지름 a(1+ε))을 z = ζ + a²/ζ 로
//   옮긴 모양이고, 받음각 0 · 순환 0 의 흐름이라 꼬리 끝(뾰족점)에서 흐름이 매끈하게
//   떠난다(쿠타 조건이 저절로 선다).
// - 소용돌이: 뒤꼍 위 · 아래에서 번갈아 떨어진다(주기 T = D / (St·U), 한쪽마다). 태어난
//   뒤 세기가 차오르며 줄 빠르기 c 로 떠내려가고, 코어(램-오센)가 나이에 따라 굵어진다.
//   자리는 시계의 닫힌 함수다 — 쌓는 것은 알갱이뿐이다.
//
// 저항은 계산하지 않고 선언한 항력 계수를 쓴다. 두께 · 빠르기 · 유체가 같으므로
// 저항의 비는 항력 계수의 비다. 퍼텐셜 흐름은 저항이 0 이라(달랑베르) 이 모형으로
// 저항을 셈할 수 없다 — 모형이 그리는 것은 자국의 너비이고, 저항의 값은 실험값이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { EMIT, FIXED_DT, LAYOUT, PHYSICS } from './schema';
import type { DragInFluidState, LaneTracers, Tracer } from './state';

export interface DragInFluidConstants {
  speed: number;
  thickness: number;
  strouhal: number;
  streetSpeed: number;
  circulation: number;
  circulationStreamlined: number;
  wakeHalf: number;
  wakeHalfStreamlined: number;
  cdCylinder: number;
  cdStreamlined: number;
  arrowPerCd: number;
  joukowskiEps: number;
}

export function readConstants(stage: StageDef): DragInFluidConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    speed: c.speed ?? PHYSICS.speed,
    thickness: c.thickness ?? PHYSICS.thickness,
    strouhal: c.strouhal ?? PHYSICS.strouhal,
    streetSpeed: c.streetSpeed ?? PHYSICS.streetSpeed,
    circulation: c.circulation ?? PHYSICS.circulation,
    circulationStreamlined: c.circulationStreamlined ?? PHYSICS.circulationStreamlined,
    wakeHalf: c.wakeHalf ?? PHYSICS.wakeHalf,
    wakeHalfStreamlined: c.wakeHalfStreamlined ?? PHYSICS.wakeHalfStreamlined,
    cdCylinder: c.cdCylinder ?? PHYSICS.cdCylinder,
    cdStreamlined: c.cdStreamlined ?? PHYSICS.cdStreamlined,
    arrowPerCd: c.arrowPerCd ?? PHYSICS.arrowPerCd,
    joukowskiEps: c.joukowskiEps ?? PHYSICS.joukowskiEps,
  };
}

// ------------------------------------------------------------------------
// 복소수 — 필요한 만큼만
// ------------------------------------------------------------------------

type C = readonly [number, number];
const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const csqrt = (a: C): C => {
  const r = Math.hypot(a[0], a[1]);
  const re = Math.sqrt(Math.max(0, (r + a[0]) / 2));
  const im = Math.sqrt(Math.max(0, (r - a[0]) / 2));
  return [re, a[1] < 0 ? -im : im];
};

// ------------------------------------------------------------------------
// 두 몸의 모양
// ------------------------------------------------------------------------

/** 유선형(주코프스키 단면)의 치수. 레인 좌표에서 앞끝이 원기둥 앞면(x = −R)에 온다. */
export interface Streamlined {
  /** 사상 상수 a. */
  a: number;
  eps: number;
  /** ζ 평면 원의 중심 x · 반지름. */
  cx: number;
  rc: number;
  /** 주코프스키 좌표 → 레인 좌표로 옮기는 가로 이동. */
  shift: number;
  /** 꼬리 끝 x(레인 좌표). */
  tail: number;
  /** 윤곽(레인 좌표, 몸 중심 레인 원점 기준). */
  outline: readonly C[];
}

const OUTLINE_SAMPLES = 180;

function joukowskiOutline(a: number, eps: number): C[] {
  const cx = -a * eps;
  const rc = a * (1 + eps);
  const pts: C[] = [];
  for (let i = 0; i < OUTLINE_SAMPLES; i++) {
    const th = (2 * Math.PI * i) / OUTLINE_SAMPLES;
    const z: C = [cx + rc * Math.cos(th), rc * Math.sin(th)];
    const inv = cdiv([a * a, 0], z);
    pts.push([z[0] + inv[0], z[1] + inv[1]]);
  }
  return pts;
}

/** 두께가 원기둥 지름과 같도록 a 를 맞춘 유선형. */
export function streamlinedShape(k: DragInFluidConstants): Streamlined {
  const eps = k.joukowskiEps;
  const unit = joukowskiOutline(1, eps);
  const ys = unit.map((p) => p[1]);
  const t1 = Math.max(...ys) - Math.min(...ys);
  const a = k.thickness / t1;
  const raw = joukowskiOutline(a, eps);
  const minX = Math.min(...raw.map((p) => p[0]));
  const shift = -k.thickness / 2 - minX;
  return {
    a,
    eps,
    cx: -a * eps,
    rc: a * (1 + eps),
    shift,
    tail: 2 * a + shift,
    outline: raw.map((p) => [p[0] + shift, p[1]] as C),
  };
}

// ------------------------------------------------------------------------
// 소용돌이 줄
// ------------------------------------------------------------------------

export type LaneKind = 'cylinder' | 'streamlined';

export interface Vortex {
  x: number;
  y: number;
  /** 순환(반시계 +). */
  gamma: number;
  /** 코어 반지름. */
  core: number;
}

/** 소용돌이가 태어나 세기가 차오르는 시간 상수(초). */
const FORM_TAU = 0.45;
/** 코어 반지름 — 태어날 때(두께 비) · 나이에 따라 굵어지는 빠르기(월드²/초 ÷ D²). */
const CORE0 = { cylinder: 0.34, streamlined: 0.1 } as const;
const CORE_GROWTH = 0.045;
/** 태어나는 자리 — 뒤꼍에서 떨어진 거리 ÷ D, 처음 반폭 ÷ D. */
const BIRTH_GAP = { cylinder: 0.35, streamlined: 0.12 } as const;
const BIRTH_HALF = { cylinder: 0.42, streamlined: 0.04 } as const;
/** 레인 끝을 이만큼 지나면 소용돌이를 더 세지 않는다(월드). */
const VORTEX_TAIL = 160;

interface LaneGeometry {
  kind: LaneKind;
  /** 뒤꼍 x — 원기둥은 R, 유선형은 꼬리 끝. */
  rear: number;
  body: Streamlined | null;
}

function laneGeometry(kind: LaneKind, k: DragInFluidConstants, sl: Streamlined): LaneGeometry {
  return kind === 'cylinder'
    ? { kind, rear: k.thickness / 2, body: null }
    : { kind, rear: sl.tail, body: sl };
}

/** 시각 `clock` 에 레인에 살아 있는 소용돌이들. 시계의 닫힌 함수다. */
export function vorticesAt(clock: number, g: LaneGeometry, k: DragInFluidConstants): Vortex[] {
  const D = k.thickness;
  const U = k.speed;
  const c = k.streetSpeed * U;
  const half = (g.kind === 'cylinder' ? k.wakeHalf : k.wakeHalfStreamlined) * D;
  const half0 = BIRTH_HALF[g.kind] * D;
  const gammaMax = (g.kind === 'cylinder' ? k.circulation : k.circulationStreamlined) * U * D;
  const core0 = CORE0[g.kind] * D;
  const xb = g.rear + BIRTH_GAP[g.kind] * D;
  // 한쪽이 한 번 떨구는 주기 T, 위 · 아래가 번갈아 반 주기마다.
  const every = D / (k.strouhal * U) / 2;
  const maxAge = (LAYOUT.x1 + VORTEX_TAIL - xb) / c + FORM_TAU * 2;

  const out: Vortex[] = [];
  const kLast = Math.floor(clock / every);
  const kFirst = Math.ceil((clock - maxAge) / every);
  for (let n = kFirst; n <= kLast; n++) {
    const age = clock - n * every;
    if (age < 0) continue;
    const top = ((n % 2) + 2) % 2 === 0;
    const grow = 1 - Math.exp(-age / FORM_TAU);
    const x = xb + c * (age - FORM_TAU * grow);
    const y = (top ? 1 : -1) * (half0 + (half - half0) * grow);
    // 위 줄은 시계 방향(바깥이 빠르고 자국이 느리다), 아래 줄은 반시계.
    const gamma = (top ? -1 : 1) * gammaMax * grow;
    const core = Math.sqrt(core0 * core0 + CORE_GROWTH * D * D * age);
    out.push({ x, y, gamma, core });
  }
  return out;
}

// ------------------------------------------------------------------------
// 속도장
// ------------------------------------------------------------------------

/** 몸 안쪽인가. */
function inside(x: number, y: number, g: LaneGeometry, k: DragInFluidConstants): boolean {
  if (!g.body) return x * x + y * y < (k.thickness / 2) ** 2;
  const zeta = toZeta(x, y, g.body);
  return Math.hypot(zeta[0] - g.body.cx, zeta[1]) < g.body.rc;
}

/** 주코프스키 역사상 — 몸 바깥에 해당하는 근(|ζ| 가 큰 쪽). */
function toZeta(x: number, y: number, b: Streamlined): C {
  const z: C = [x - b.shift, y];
  const disc = csqrt([z[0] * z[0] - z[1] * z[1] - 4 * b.a * b.a, 2 * z[0] * z[1]]);
  const r1: C = [(z[0] + disc[0]) / 2, (z[1] + disc[1]) / 2];
  const r2: C = [(z[0] - disc[0]) / 2, (z[1] - disc[1]) / 2];
  return Math.hypot(r1[0], r1[1]) >= Math.hypot(r2[0], r2[1]) ? r1 : r2;
}

/** 몸이 비껴 내는 흐름을 포함한 퍼텐셜 속도. */
function potential(x: number, y: number, g: LaneGeometry, k: DragInFluidConstants): C {
  const U = k.speed;
  if (!g.body) {
    const R2 = (k.thickness / 2) ** 2;
    const z2 = cmul([x, y], [x, y]);
    const w = cdiv([R2, 0], z2);
    // w = u − iv
    return [U * (1 - w[0]), U * w[1]];
  }
  const b = g.body;
  const zeta = toZeta(x, y, b);
  const rel: C = [zeta[0] - b.cx, zeta[1]];
  const dW = cdiv([b.rc * b.rc, 0], cmul(rel, rel));
  const dWdZeta: C = [U * (1 - dW[0]), -U * dW[1]];
  const m = cdiv([b.a * b.a, 0], cmul(zeta, zeta));
  const dzdZeta: C = [1 - m[0], -m[1]];
  // 꼬리 끝(두 값이 함께 0)에서는 흐름이 매끈히 떠나는 빠르기로 둔다.
  if (Math.hypot(dzdZeta[0], dzdZeta[1]) < 1e-4) return [U, 0];
  const w = cdiv(dWdZeta, dzdZeta);
  return [w[0], -w[1]];
}

function velocity(x: number, y: number, g: LaneGeometry, k: DragInFluidConstants, vs: readonly Vortex[]): C {
  const p = potential(x, y, g, k);
  let u = p[0];
  let v = p[1];
  for (const w of vs) {
    const dx = x - w.x;
    const dy = y - w.y;
    const r2 = dx * dx + dy * dy + 1e-6;
    const f = (w.gamma / (2 * Math.PI * r2)) * (1 - Math.exp(-r2 / (w.core * w.core)));
    u -= f * dy;
    v += f * dx;
  }
  return [u, v];
}

/** 레인의 지금 속도 — 알갱이 꼬리(속도 획)를 그리는 데 쓴다. */
export function tracerVelocities(
  tracers: readonly Tracer[],
  kind: LaneKind,
  clock: number,
  k: DragInFluidConstants,
): C[] {
  const g = laneGeometry(kind, k, streamlinedShape(k));
  const vs = vorticesAt(clock, g, k);
  return tracers.map((t) => velocity(t.x, t.y, g, k, vs));
}

// ------------------------------------------------------------------------
// 한 걸음
// ------------------------------------------------------------------------

/** 연기 줄의 y — 가운데를 비껴 둔다(정체점에 영원히 붙는 줄이 없게). */
export function smokeRows(): number[] {
  const rows: number[] = [];
  for (let j = 0; j < EMIT.rows; j++) rows.push((j - (EMIT.rows - 1) / 2) * EMIT.rowGap);
  return rows;
}

/** 염료가 나오는 자리 — 원기둥은 위 · 아래 떨어짐점, 유선형은 꼬리 끝 양옆. */
function dyeSources(g: LaneGeometry, k: DragInFluidConstants): C[] {
  const R = k.thickness / 2;
  if (!g.body) {
    // 앞 정체점에서 80° — 층류 떨어짐 자리. 둘레에서 살짝 띄운다.
    const th = (80 * Math.PI) / 180;
    const r = R + 1.5;
    return [
      [-r * Math.cos(th), r * Math.sin(th)],
      [-r * Math.cos(th), -r * Math.sin(th)],
    ];
  }
  return [
    [g.rear + 1, 1],
    [g.rear + 1, -1],
  ];
}

function advance(
  list: readonly Tracer[],
  g: LaneGeometry,
  k: DragInFluidConstants,
  clock: number,
  dt: number,
): Tracer[] {
  const vs0 = vorticesAt(clock, g, k);
  const vsMid = vorticesAt(clock + dt / 2, g, k);
  const out: Tracer[] = [];
  for (const t of list) {
    const a = velocity(t.x, t.y, g, k, vs0);
    const mx = t.x + (a[0] * dt) / 2;
    const my = t.y + (a[1] * dt) / 2;
    const b = velocity(mx, my, g, k, vsMid);
    const x = t.x + b[0] * dt;
    const y = t.y + b[1] * dt;
    if (x > LAYOUT.x1 + 10 || Math.abs(y) > LAYOUT.half + 20 || x < LAYOUT.x0 - 20) continue;
    if (inside(x, y, g, k)) continue;
    out.push({ x, y, age: t.age + dt });
  }
  return out;
}

function stepLane(
  lane: LaneTracers,
  kind: LaneKind,
  k: DragInFluidConstants,
  sl: Streamlined,
  clock: number,
  emitSmoke: boolean,
  emitDye: boolean,
): LaneTracers {
  const g = laneGeometry(kind, k, sl);
  const smoke = advance(lane.smoke, g, k, clock, FIXED_DT);
  const dye = advance(lane.dye, g, k, clock, FIXED_DT);
  if (emitSmoke) for (const y of smokeRows()) smoke.push({ x: LAYOUT.x0, y, age: 0 });
  if (emitDye) for (const [x, y] of dyeSources(g, k)) dye.push({ x, y, age: 0 });
  return { smoke, dye };
}

/** 한 걸음. 순수 함수. 실시간 dt 를 고정 걸음으로 나눠 걷는다(장부 G39). */
export function step(params: { state: DragInFluidState; dt: number; stage: StageDef }): DragInFluidState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const k = readConstants(stage);
  const sl = streamlinedShape(k);
  let s = { ...state, acc: state.acc + Math.min(dt, 0.25) };
  while (s.acc >= FIXED_DT) {
    const smokeDue = s.smokeDue - FIXED_DT;
    const dyeDue = s.dyeDue - FIXED_DT;
    const emitSmoke = smokeDue <= 0;
    const emitDye = dyeDue <= 0;
    s = {
      clock: s.clock + FIXED_DT,
      acc: s.acc - FIXED_DT,
      smokeDue: emitSmoke ? smokeDue + EMIT.smokeEvery : smokeDue,
      dyeDue: emitDye ? dyeDue + EMIT.dyeEvery : dyeDue,
      cylinder: stepLane(s.cylinder, 'cylinder', k, sl, s.clock, emitSmoke, emitDye),
      streamlined: stepLane(s.streamlined, 'streamlined', k, sl, s.clock, emitSmoke, emitDye),
    };
  }
  return s;
}

// ------------------------------------------------------------------------
// 시간표에서 읽는 것
// ------------------------------------------------------------------------

/** 저항 화살표가 자란 정도 0~1 — `drag` 동안 자라고 `fade` 에 거둔다. */
export function arrowGrowth(tl: TimelineFrame): number {
  return tl.at('drag');
}

export function arrowOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}
