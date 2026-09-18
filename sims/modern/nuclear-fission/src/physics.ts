// ========================================================================
// nuclear-fission — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 핵의 모양 · 조각과 중성자의 자리는 모두 시간표 진행도와
// 스테이지 상수의 함수다. `step` 은 항등이다.
//
// 핵 반지름 — A^⅓ 에 비례한다(`radiusScale`). 중성자 하나의 반지름이 곧 축척이다.
//
// 갈라지는 모양 — 두 원(장차 두 조각)과 그 둘에 바깥에서 접하는 필렛 원호 둘로 경계를
// 짓는다. 필렛 반지름이 무한대면 두 원의 볼록 껍질(캡슐), 0 이면 두 원의 합집합(잘록한
// 목이 뾰족)이다. 원의 중심 거리 · 반지름 · 목 폭을 진행도로 옮겨 원 → 캡슐 → 아령 →
// 두 원이 닿는 순간까지 이어 간다.
//
// 조각의 운동 — 두 조각은 서로의 전기적 반발로 멈춘 상태에서 빨라져 끝 속력에 다가간다.
// v(τ) = v∞ (1 − e^(−τ/T)),  x(τ) = v∞ (τ − T (1 − e^(−τ/T))).
// 운동량이 같도록 무거운 조각의 끝 속력은 가벼운 조각의 A_L / A_H 배다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  A_HEAVY,
  A_LIGHT,
  A_TARGET,
  ENERGY_MEV,
  FRAGMENT_SPEED,
  NEUTRON_SPEED,
  N_OUT,
  RADIUS_SCALE,
  REPULSION_TIME,
  SEED,
  SYMBOLS,
  Z_HEAVY,
  Z_LIGHT,
  Z_TARGET,
} from './schema';
import type { NuclearFissionState } from './state';

export interface Nuclide {
  z: number;
  a: number;
}

export interface NuclearFissionConstants {
  target: Nuclide;
  heavy: Nuclide;
  light: Nuclide;
  nOut: number;
  energyMeV: number;
  radiusScale: number;
  fragmentSpeed: number;
  repulsionTime: number;
  neutronSpeed: number;
  seed: number;
}

/**
 * 스테이지 상수를 기본값과 함께 읽는다 (원칙 2).
 *
 * 질량수 · 원자 번호가 맞지 않으면 던진다 — 조각의 주장이 「알갱이 수는 그대로다」 라서,
 * 저작자가 한쪽만 바꾼 선언이 조용히 틀린 장부를 띄우지 않게 한다.
 */
export function readConstants(stage: StageDef): NuclearFissionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const k: NuclearFissionConstants = {
    target: { z: c.zTarget ?? Z_TARGET, a: c.aTarget ?? A_TARGET },
    heavy: { z: c.zHeavy ?? Z_HEAVY, a: c.aHeavy ?? A_HEAVY },
    light: { z: c.zLight ?? Z_LIGHT, a: c.aLight ?? A_LIGHT },
    nOut: c.nOut ?? N_OUT,
    energyMeV: c.energyMeV ?? ENERGY_MEV,
    radiusScale: c.radiusScale ?? RADIUS_SCALE,
    fragmentSpeed: c.fragmentSpeed ?? FRAGMENT_SPEED,
    repulsionTime: c.repulsionTime ?? REPULSION_TIME,
    neutronSpeed: c.neutronSpeed ?? NEUTRON_SPEED,
    seed: c.seed ?? SEED,
  };
  if (k.target.a + 1 !== k.heavy.a + k.light.a + k.nOut) {
    throw new Error('nuclear-fission: 질량수가 맞지 않는다 — aTarget + 1 = aHeavy + aLight + nOut 이어야 한다');
  }
  if (k.target.z !== k.heavy.z + k.light.z) {
    throw new Error('nuclear-fission: 원자 번호가 맞지 않는다 — zTarget = zHeavy + zLight 이어야 한다');
  }
  return k;
}

/** 원자 번호의 기호. 표에 없는 Z 는 던진다 — 빈 이름표로 조용히 틀리지 않게. */
export function symbolOf(z: number): string {
  const s = SYMBOLS[z];
  if (!s) throw new Error(`nuclear-fission: 기호 표에 Z=${z} 가 없다`);
  return s;
}

/** 핵 반지름(월드) — A^⅓ 에 비례. */
export function radiusOf(a: number, scale: number): number {
  return scale * Math.cbrt(a);
}

/** 캡션 `vars` 가 가리킬 문자열 — 스테이지 상수에서 만든다. 선언된 정수를 그대로 쓴다. */
export function captionOf(k: NuclearFissionConstants): NuclearFissionState['caption'] {
  return {
    sT: symbolOf(k.target.z),
    aT: String(k.target.a),
    // 선언된 두 정수의 합이라 반올림이 끼지 않는다.
    aC: String(k.target.a + 1),
    sH: symbolOf(k.heavy.z),
    aH: String(k.heavy.a),
    sL: symbolOf(k.light.z),
    aL: String(k.light.a),
    n: String(k.nOut),
    e: String(k.energyMeV),
  };
}

// ------------------------------------------------------------------------
// 조각의 운동
// ------------------------------------------------------------------------

/** 갈라진 뒤 τ 초에 조각이 간 거리(끝 속력 v∞ 기준). */
export function repelDistance(tau: number, vInf: number, T: number): number {
  if (tau <= 0) return 0;
  return vInf * (tau - T * (1 - Math.exp(-tau / T)));
}

/** 갈라진 뒤 τ 초의 조각 속력. */
export function repelSpeed(tau: number, vInf: number, T: number): number {
  if (tau <= 0) return 0;
  return vInf * (1 - Math.exp(-tau / T));
}

// ------------------------------------------------------------------------
// 중성자 방향 — (시드, 주기 번호)의 함수
// ------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = s;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 중성자가 튀어나오는 방향의 기본 기울기(축에서 잰 라디안)와 흩어짐 폭. */
const NEUTRON_TILT = (42 * Math.PI) / 180;
const NEUTRON_SPREAD = (8 * Math.PI) / 180;

/**
 * 이번 주기에 튀어나오는 중성자들의 방향(단위 벡터). k 번째는 오른쪽 · 왼쪽을 번갈아,
 * 위 · 아래를 두 개마다 바꿔 서로 겹치지 않게 하고, 흩어짐만 (시드, 주기)로 뽑는다.
 */
export function neutronDirections(seed: number, cycle: number, n: number): Vec2[] {
  const rand = mulberry32(seed * 7919 + cycle * 104729);
  const out: Vec2[] = [];
  for (let k = 0; k < n; k++) {
    const right = k % 2 === 0;
    const up = Math.floor((k + 1) / 2) % 2 === 0;
    const tilt = NEUTRON_TILT + (rand() * 2 - 1) * NEUTRON_SPREAD;
    const a = (right ? 0 : Math.PI) + (right === up ? tilt : -tilt);
    out.push([Math.cos(a), Math.sin(a)]);
  }
  return out;
}

// ------------------------------------------------------------------------
// 모양
// ------------------------------------------------------------------------

/** 원호를 표본하는 각 간격(라디안) (장부 G28). */
const ARC_STEP = 0.09;

function arc(cx: number, cy: number, r: number, from: number, to: number, out: Vec2[]): void {
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / ARC_STEP));
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
}

/** 원 하나. */
export function circlePoints(c: Vec2, r: number): Vec2[] {
  const out: Vec2[] = [];
  arc(c[0], c[1], r, 0, Math.PI * 2 - ARC_STEP, out);
  return out;
}

/**
 * 흔들리는 핵 — 길쭉 ↔ 납작을 오가는 사중극 변형. `b` 가 양이면 가로로 길다.
 * 넓이가 거의 같도록 반지름을 나눠 준다.
 */
export function wobblePoints(c: Vec2, r: number, b: number): Vec2[] {
  const out: Vec2[] = [];
  const norm = Math.sqrt(1 + (b * b) / 2);
  const n = Math.ceil((Math.PI * 2) / ARC_STEP);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = (r * (1 + b * Math.cos(2 * a))) / norm;
    out.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]);
  }
  return out;
}

/** 필렛 원 — 두 원에 바깥에서 접하는 반지름 ρ 의 원. c1 기준 x 와 높이 y. 없으면 undefined. */
function fillet(d: number, r1: number, r2: number, rho: number): { x: number; y: number } | undefined {
  const a = r1 + rho;
  const b = r2 + rho;
  const x = (a * a - b * b + d * d) / (2 * d);
  const y2 = a * a - x * x;
  if (y2 < 0) return undefined;
  return { x, y: Math.sqrt(y2) };
}

/** 목의 반폭 — 필렛 원 꼭대기에서 반지름을 뺀 것. */
function neckOf(d: number, r1: number, r2: number, rho: number): number {
  const f = fillet(d, r1, r2, rho);
  return f ? f.y - rho : 0;
}

/** 필렛 반지름을 찾는 범위. 위 끝은 사실상 무한대(볼록 껍질)다. */
const RHO_MIN = 1e-5;
const RHO_MAX = 400;
const BISECT_STEPS = 48;

/**
 * 아령 모양의 경계. 가로축 위 두 원(c1x, r1) · (c2x, r2), c1x < c2x.
 * `pinch` 0 이면 볼록 껍질(캡슐), 1 이면 필렛이 사라져 두 원이 목에서 만난다.
 */
export function dumbbellPoints(c1x: number, r1: number, c2x: number, r2: number, pinch: number): Vec2[] {
  const d = c2x - c1x;
  if (d < 1e-4) return circlePoints([c1x, 0], Math.max(r1, r2));
  const hHull = neckOf(d, r1, r2, RHO_MAX);
  const hMin = neckOf(d, r1, r2, RHO_MIN);
  const target = hMin + (hHull - hMin) * (1 - pinch);
  // 목 반폭은 ρ 에 따라 늘어난다 — 이분법으로 목표 폭의 ρ 를 찾는다.
  let lo = RHO_MIN;
  let hi = RHO_MAX;
  for (let i = 0; i < BISECT_STEPS; i++) {
    const mid = Math.sqrt(lo * hi);
    if (neckOf(d, r1, r2, mid) < target) lo = mid;
    else hi = mid;
  }
  const rho = hi;
  const f = fillet(d, r1, r2, rho);
  if (!f) return [...circlePoints([c1x, 0], r1), ...circlePoints([c2x, 0], r2)];
  const fx = c1x + f.x;
  const fy = f.y;
  // 접점 각 — 원 중심에서 필렛 중심 쪽.
  const phi1 = Math.atan2(fy, fx - c1x);
  const phi2 = Math.atan2(fy, fx - c2x);
  // 필렛 원에서 두 접점을 향한 각.
  const alpha2 = Math.atan2(-fy, c2x - fx);
  const alpha1 = Math.atan2(-fy, c1x - fx);

  const out: Vec2[] = [];
  // 오른쪽 원의 바깥쪽 — 아래 접점 → 위 접점(반시계).
  arc(c2x, 0, r2, -phi2, phi2, out);
  // 위 필렛 — 오른쪽 접점 → 왼쪽 접점(오목하게).
  arc(fx, fy, rho, alpha2, alpha1, out);
  // 왼쪽 원의 바깥쪽 — 위 접점 → 아래 접점(반시계, 180° 를 지나).
  arc(c1x, 0, r1, phi1, Math.PI * 2 - phi1, out);
  // 아래 필렛 — 위 필렛의 거울상, 왼쪽 → 오른쪽.
  arc(fx, -fy, rho, -alpha1, -alpha2, out);
  return out;
}

/** 쌓는 상태가 없다 — 캡션 문자열만 들고 있다. */
export function step(params: { state: NuclearFissionState }): NuclearFissionState {
  return params.state;
}
