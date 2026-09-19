// ========================================================================
// magnetic-dipole — 순수 물리
// ========================================================================
// 두 원천의 장을 축 대칭 단면(ρ = 축에서 잰 거리, z = 축 방향)에서 정확히 계산한다.
//
//   고리 전류 — 반지름 a, 전류 I 인 원형 고리. 완전 타원 적분 K · E (AGM).
//   막대자석 — 반지름 b, 길이 L 인 원기둥을 축 방향으로 고르게 자화한 것. 고르게 자화된
//              물체의 B 는 옆면을 감는 표면 전류 K = M(원기둥 솔레노이드)의 장과 같다.
//              Derby & Olbert(2010)의 닫힌 식 — Bulirsch 일반 완전 타원 적분 `cel`.
//
// 단위는 μ₀/2π = 1 이다. 두 원천의 쌍극자 모멘트는 고리 I·πa², 자석 K·πb²L 이고
// 자석의 K 는 선언한 쌍극자 세기에서 거꾸로 정한다.
//
// 장선은 **자속 함수 Ψ(축을 감싼 원을 지나는 자속 / 2π)의 등고선**이다. 두 원천에 같은 준위
// 목록을 쓴다 — 적도면(z = 0) 바깥에서 Ψ 가 그 준위가 되는 자리를 씨앗으로 두고 장을 따라
// 한 바퀴 돌아 닫는다. 같은 준위라서 모멘트가 같으면 멀리서 두 선이 같은 자리를 지난다.
// 모멘트가 다르면 멀리서도 어긋난다 — 겹침은 연출이 아니라 계산에서 나온다.
//
// 모두 스테이지 상수의 함수라 쌓을 것이 없다. 장선은 `initialState` 가 한 번 만든다 (state.ts).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  FADE_REACH_FROM,
  FADE_REACH_TO,
  FAR_SCALE,
  LINE_COUNT,
  LOOP_CURRENT,
  LOOP_RADIUS,
  LOOP_TILT,
  MAGNET_LENGTH,
  MAGNET_MOMENT,
  MAGNET_WIDTH,
  REACH_MIN,
  REACH_RATIO,
  WIRE_MARK,
} from './schema';
import type { MagneticDipoleState } from './state';

export interface DipoleConstants {
  loopRadius: number;
  loopCurrent: number;
  magnetLength: number;
  magnetWidth: number;
  magnetMoment: number;
  reachMin: number;
  reachRatio: number;
  lineCount: number;
  farScale: number;
  fadeReachFrom: number;
  fadeReachTo: number;
  loopTilt: number;
  wireMark: number;
}

export function readConstants(stage: StageDef): DipoleConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    loopRadius: c.loopRadius ?? LOOP_RADIUS,
    loopCurrent: c.loopCurrent ?? LOOP_CURRENT,
    magnetLength: c.magnetLength ?? MAGNET_LENGTH,
    magnetWidth: c.magnetWidth ?? MAGNET_WIDTH,
    magnetMoment: c.magnetMoment ?? MAGNET_MOMENT,
    reachMin: c.reachMin ?? REACH_MIN,
    reachRatio: c.reachRatio ?? REACH_RATIO,
    lineCount: c.lineCount ?? LINE_COUNT,
    farScale: c.farScale ?? FAR_SCALE,
    fadeReachFrom: c.fadeReachFrom ?? FADE_REACH_FROM,
    fadeReachTo: c.fadeReachTo ?? FADE_REACH_TO,
    loopTilt: c.loopTilt ?? LOOP_TILT,
    wireMark: c.wireMark ?? WIRE_MARK,
  };
}

// ------------------------------------------------------------------------
// 수치 계산의 정밀도 — 화면이 아니라 계산의 몫이다.
// ------------------------------------------------------------------------

/** AGM · cel 반복을 멈추는 상대 차이. */
const ELLIPTIC_EPS = 1e-12;
/** 이보다 축에 가까우면 지름 방향 장을 0 으로 둔다(축 위에서는 대칭으로 0). */
const AXIS_EPS = 1e-9;
/** 자속 적분(무한대에서 안으로)의 칸 수. */
const FLUX_SAMPLES = 400;
/** 씨앗 자리 이분법 횟수. */
const BISECT_ITERS = 60;
/** 이분법 시작 — 원천 가장자리에서 이만큼(비) 떨어진 자리. */
const EDGE_GAP = 1e-3;
/** 장선 추적 기본 걸음(월드). 원점에서 멀수록 `r / loopRadius` 배로 늘린다. */
const TRACE_STEP = 0.008;
/** 한 가닥의 최대 걸음 수. */
const MAX_TRACE_STEPS = 6000;
/** 한 바퀴 판정(적도면 건넘)을 시작하기 전 걸음 수. */
const MIN_LOOP_STEPS = 30;

// ------------------------------------------------------------------------
// 타원 적분
// ------------------------------------------------------------------------

/** 제1 · 제2종 완전 타원 적분 K(m), E(m) — 산술 기하 평균(AGM). m = k². */
function ellipticKE(m: number): { K: number; E: number } {
  let a = 1;
  let b = Math.sqrt(1 - m);
  let c = Math.sqrt(m);
  let pow = 0.5;
  let sum = pow * c * c;
  for (let i = 0; i < 40 && Math.abs(c) > ELLIPTIC_EPS; i++) {
    const an = (a + b) / 2;
    const bn = Math.sqrt(a * b);
    c = (a - b) / 2;
    pow *= 2;
    sum += pow * c * c;
    a = an;
    b = bn;
  }
  const K = Math.PI / (2 * a);
  return { K, E: K * (1 - sum) };
}

/** Bulirsch 일반 완전 타원 적분 cel(kc, p, c, s). */
function cel(kc: number, p: number, c: number, s: number): number {
  let k = Math.abs(kc);
  let pp = p;
  let cc = c;
  let ss = s;
  let em = 1;
  if (p > 0) {
    pp = Math.sqrt(p);
    ss = s / pp;
  } else {
    let f = kc * kc;
    let q = 1 - f;
    const g = 1 - pp;
    f -= pp;
    q *= ss - c * pp;
    pp = Math.sqrt(f / g);
    cc = (c - ss) / g;
    ss = -q / (g * g * pp) + cc * pp;
  }
  let f = cc;
  cc += ss / pp;
  let g = k / pp;
  ss = 2 * (ss + f * g);
  pp += g;
  g = em;
  em += k;
  let kk = k;
  for (let i = 0; i < 60 && Math.abs(g - k) > g * ELLIPTIC_EPS; i++) {
    k = 2 * Math.sqrt(kk);
    kk = k * em;
    f = cc;
    cc += ss / pp;
    g = kk / pp;
    ss = 2 * (ss + f * g);
    pp += g;
    g = em;
    em += k;
  }
  return (Math.PI / 2) * ((ss + cc * em) / (em * (em + pp)));
}

// ------------------------------------------------------------------------
// 두 원천의 장 — (ρ ≥ 0, z) 에서 [Bρ, Bz]
// ------------------------------------------------------------------------

/** 반지름 `a`, 전류 `current` 인 고리(z = 0)의 장. */
export function loopField(rho: number, z: number, a: number, current: number): Vec2 {
  const alpha2 = (a - rho) * (a - rho) + z * z;
  const beta2 = (a + rho) * (a + rho) + z * z;
  const beta = Math.sqrt(beta2);
  const m = 1 - alpha2 / beta2;
  const { K, E } = ellipticKE(m);
  const bz = (current / beta) * (K + ((a * a - rho * rho - z * z) / alpha2) * E);
  const br = rho < AXIS_EPS ? 0 : ((current * z) / (rho * beta)) * (((a * a + rho * rho + z * z) / alpha2) * E - K);
  return [br, bz];
}

/**
 * 반지름 `b`, 길이 `length`, 옆면 표면 전류 `sheet`(단위 길이당) 인 원기둥 솔레노이드의 장
 * — 고르게 자화된 막대자석의 B 와 같다. Derby & Olbert, Am. J. Phys. 78, 229 (2010).
 */
export function magnetField(rho: number, z: number, b: number, length: number, sheet: number): Vec2 {
  const half = length / 2;
  // B₀ = μ₀K/π, 단위 μ₀/2π = 1 → 2K.
  const b0 = 2 * sheet;
  const zp = z + half;
  const zn = z - half;
  const sp = Math.sqrt(zp * zp + (rho + b) * (rho + b));
  const sn = Math.sqrt(zn * zn + (rho + b) * (rho + b));
  const kp = Math.sqrt(zp * zp + (b - rho) * (b - rho)) / sp;
  const kn = Math.sqrt(zn * zn + (b - rho) * (b - rho)) / sn;
  const gamma = (b - rho) / (b + rho);
  const br = rho < AXIS_EPS ? 0 : b0 * ((b / sp) * cel(kp, 1, 1, -1) - (b / sn) * cel(kn, 1, 1, -1));
  const bz =
    ((b0 * b) / (b + rho)) * ((zp / sp) * cel(kp, gamma * gamma, 1, gamma) - (zn / sn) * cel(kn, gamma * gamma, 1, gamma));
  return [br, bz];
}

/** 원천 하나 — 장과, 적도면에서 씨앗을 찾기 시작할 가장자리. */
export interface Source {
  /** (ρ ≥ 0, z) 의 장 [Bρ, Bz]. */
  readonly field: (rho: number, z: number) => Vec2;
  /** 적도면 위 원천의 바깥 가장자리(ρ). 고리는 도선, 자석은 옆면. */
  readonly edge: number;
}

export function loopSource(c: DipoleConstants): Source {
  return { field: (r, z) => loopField(r, z, c.loopRadius, c.loopCurrent), edge: c.loopRadius };
}

/** 자석의 표면 전류는 선언한 쌍극자 세기에서 정한다 — m = K·πb²L. */
export function magnetSource(c: DipoleConstants): Source {
  const b = c.magnetWidth / 2;
  const sheet = c.magnetMoment / (Math.PI * b * b * c.magnetLength);
  return { field: (r, z) => magnetField(r, z, b, c.magnetLength, sheet), edge: b };
}

/** 월드 단면 자리 `p` 의 장(월드 성분). ρ < 0 은 거울상이다. */
function fieldAt(src: Source, p: Vec2): Vec2 {
  const [br, bz] = src.field(Math.abs(p[0]), p[1]);
  return [p[0] < 0 ? -br : br, bz];
}

// ------------------------------------------------------------------------
// 자속 함수와 씨앗
// ------------------------------------------------------------------------

/**
 * 적도면(z = 0) 위 반지름 ρ 원 **바깥**을 지나는 자속 / 2π 의 부호를 뒤집은 값 = 원 안을
 * 지나는 자속 / 2π (전체 자속은 0). ρ' = ρ/u 로 바꿔 무한대를 [0, 1] 로 당긴다 —
 * 멀리서 장이 1/ρ'³ 로 줄어 적분꼴이 유한하다.
 */
export function equatorFlux(src: Source, rho: number): number {
  const du = 1 / FLUX_SAMPLES;
  let sum = 0;
  for (let i = 0; i < FLUX_SAMPLES; i++) {
    const u = (i + 0.5) * du;
    const [, bz] = src.field(rho / u, 0);
    sum += (-bz / (u * u * u)) * du;
  }
  return rho * rho * sum;
}

/**
 * 준위 목록 — k 번째 선이 **점 쌍극자라면** 적도면에서 `reachMin · reachRatio^k` 를 지나는
 * 준위. 점 쌍극자의 적도면 자속은 m / 2ρ (단위 μ₀/2π = 1). 기준 모멘트는 고리의 I·πa² 다.
 * 두 원천에 같은 목록을 쓴다.
 */
export function fluxLevels(c: DipoleConstants): number[] {
  const m = c.loopCurrent * Math.PI * c.loopRadius * c.loopRadius;
  const out: number[] = [];
  for (let k = 0; k < c.lineCount; k++) out.push(m / (2 * c.reachMin * Math.pow(c.reachRatio, k)));
  return out;
}

/** 적도면 바깥에서 자속이 `level` 이 되는 ρ. 원천이 그만큼의 자속을 내지 못하면 없다. */
export function seedRadius(src: Source, level: number): number | undefined {
  let lo = src.edge * (1 + EDGE_GAP);
  if (equatorFlux(src, lo) <= level) return undefined;
  let hi = lo * 2;
  for (let i = 0; i < BISECT_ITERS && equatorFlux(src, hi) > level; i++) hi *= 2;
  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = (lo + hi) / 2;
    if (equatorFlux(src, mid) > level) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ------------------------------------------------------------------------
// 장선
// ------------------------------------------------------------------------

function unitField(src: Source, p: Vec2): Vec2 {
  const [bx, by] = fieldAt(src, p);
  const n = Math.hypot(bx, by);
  if (n === 0) return [0, 0];
  return [bx / n, by / n];
}

/**
 * 씨앗(적도면 바깥, 장이 아래를 향한다)에서 장을 따라 한 바퀴 — RK4, 걸음은 원점에서 멀수록
 * 길다. 적도면을 다시 위에서 아래로 건너면 씨앗으로 닫는다.
 */
export function traceClosed(src: Source, seed: Vec2, scaleRef: number): Vec2[] {
  const pts: Vec2[] = [seed];
  let p = seed;
  for (let i = 0; i < MAX_TRACE_STEPS; i++) {
    const h = TRACE_STEP * Math.max(1, Math.hypot(p[0], p[1]) / scaleRef);
    const k1 = unitField(src, p);
    const k2 = unitField(src, [p[0] + (h / 2) * k1[0], p[1] + (h / 2) * k1[1]]);
    const k3 = unitField(src, [p[0] + (h / 2) * k2[0], p[1] + (h / 2) * k2[1]]);
    const k4 = unitField(src, [p[0] + h * k3[0], p[1] + h * k3[1]]);
    const next: Vec2 = [
      p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
    // 적도면을 위에서 아래로 다시 건너면 한 바퀴다(씨앗에서 아래로 떠났다). 자석 모서리 곁은
    // 장이 급히 꺾여 추적 오차가 조금 쌓이므로, 씨앗과의 거리 대신 이 건넘으로 닫는다.
    const crossed = p[1] > 0 && next[1] <= 0;
    p = next;
    if (i > MIN_LOOP_STEPS && crossed) {
      pts.push(seed);
      break;
    }
    pts.push(next);
  }
  return pts;
}

/** 한 준위의 장선 — 오른쪽(ρ > 0) 한 가닥과 거울상. */
export interface FieldLine {
  /** 준위 번호 k. 멀리서의 도달 거리는 `reachMin · reachRatio^k`. */
  readonly level: number;
  /** 적도면 바깥 씨앗(ρ). 방향 꺾쇠를 여기 둔다. */
  readonly seed: number;
  readonly right: readonly Vec2[];
  readonly left: readonly Vec2[];
}

/** 원천 하나의 장선 전부. 원천 중심이 원점, 축이 세로(+z = 위)다. */
export function fieldLines(src: Source, c: DipoleConstants): FieldLine[] {
  const out: FieldLine[] = [];
  fluxLevels(c).forEach((level, k) => {
    const seed = seedRadius(src, level);
    if (seed === undefined) return;
    const right = traceClosed(src, [seed, 0], c.loopRadius);
    out.push({ level: k, seed, right, left: right.map(([x, y]) => [-x, y] as Vec2) });
  });
  return out;
}

/** 준위 k 선이 멀리서 닿는 거리(점 쌍극자 기준, 원천 좌표). 흐리기 판정에 쓴다. */
export function levelReach(k: number, c: DipoleConstants): number {
  return c.reachMin * Math.pow(c.reachRatio, k);
}

/** 모든 것이 스테이지 상수와 시간표의 함수다. 쌓을 것이 없다 (S-sim). */
export function step(params: { state: MagneticDipoleState }): MagneticDipoleState {
  return params.state;
}
