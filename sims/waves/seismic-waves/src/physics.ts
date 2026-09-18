// ========================================================================
// seismic-waves — 순수 물리
// ========================================================================
// 지구 반지름을 1 로 둔 단면에서 파선을 따라간다. 진원은 (0, 1), 오른쪽 반(x ≥ 0)을
// 계산하고 왼쪽 반은 거울상으로 쓴다.
//
// 근사 두 가지 (NOTES (b) · (c)):
//
// 1. **맨틀 속 휨.** 깊을수록 빨라지는 맨틀에서 파선은 지표 쪽으로 휜다. 여기서는 곡률을
//    `sin ψ / ρ`(ψ 는 파선과 반지름 방향 사이 각)로 둔다 — 속력이 반지름을 따라 일정하게
//    변할 때의 모양이다. ρ 는 속력 분포에서 오지 않고 **선언된 그림자 시작각에서 역산**한다:
//    외핵을 스치는 파선이 지표의 `shadowFromDeg` 에 닿도록 고른다.
// 2. **핵 속 꺾임.** 외핵은 속력이 한 값이라 파선이 곧고, 경계에서만 스넬 법칙으로 꺾인다.
//    속력비(핵 / 맨틀)도 **선언된 P 그림자 끝각에서 역산**한다: 핵을 지난 P파가 닿는 가장
//    가까운 지표가 `pShadowToDeg` 가 되도록 고른다. 실제 지구의 비(약 0.6)보다 크게 나온다 —
//    핵 속 속력 변화와 내핵을 두지 않았기 때문이다.
//
// 파선을 따라가는 **빠르기**는 휨과 따로 둔다 — 맨틀에서는 선언된 한 값(vP · vS), 핵에서는
// 역산한 비를 곱한 값이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  CORE_RATIO,
  EARTH_RADIUS_KM,
  P_SHADOW_TO_DEG,
  SHADOW_FROM_DEG,
  TRAVEL_MINUTES,
  V_P,
  V_S,
} from './schema';
import type { SeismicWavesState } from './state';

/** 파선을 따라가는 한 걸음(월드, 지구 반지름 = 1). 원판 지름에 약 500 걸음. */
const TRACE_STEP = 0.004;
/** 한 파선의 걸음 상한 — 맨틀 두 구간을 합쳐도 이 안에 끝난다. */
const TRACE_MAX_STEPS = 1500;
/** 역산 이분법의 반복 수. */
const SOLVE_ITERATIONS = 34;
/** P 그림자 끝각을 찾을 때 핵을 지나는 파선을 훑는 표본 수. */
const CORE_SCAN_SAMPLES = 72;
/** 스치는 파선을 핵 바로 바깥으로 비키는 여유(라디안). */
const GRAZE_EPS = 1e-5;

const DEG = Math.PI / 180;

export interface SeismicConstants {
  coreRatio: number;
  shadowFromDeg: number;
  pShadowToDeg: number;
  /** 맨틀 속력(km/s). */
  vP: number;
  vS: number;
  earthRadiusKm: number;
  travelMinutes: number;
}

export function readConstants(stage: StageDef): SeismicConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    coreRatio: c.coreRatio ?? CORE_RATIO,
    shadowFromDeg: c.shadowFromDeg ?? SHADOW_FROM_DEG,
    pShadowToDeg: c.pShadowToDeg ?? P_SHADOW_TO_DEG,
    vP: c.vP ?? V_P,
    vS: c.vS ?? V_S,
    earthRadiusKm: c.earthRadiusKm ?? EARTH_RADIUS_KM,
    travelMinutes: c.travelMinutes ?? TRAVEL_MINUTES,
  };
}

/** 선언에서 역산한 파선 모형. `initialState` 가 한 번 풀어 상태에 담는다. */
export interface RayModel {
  /** 맨틀 휨의 곡률 반지름(월드). */
  rho: number;
  /** 핵 속 P 속력 / 맨틀 P 속력. */
  coreSpeedRatio: number;
  /** 외핵을 스치는 파선의 출발각(곧장 아래에서 잰 라디안). 이보다 작으면 핵에 닿는다. */
  grazeTakeoff: number;
}

/** 파선 하나. 오른쪽 반의 좌표다. */
export interface RayPath {
  points: Vec2[];
  /** 점마다 진원에서 잰 경로 길이. */
  cum: number[];
  /** 핵에 들어간 점 · 나온 점의 번호. 핵에 닿지 않으면 -1. */
  coreIn: number;
  coreOut: number;
  /** 지표에 닿은 자리의 중심각(도). 핵에서 멈췄으면 null. */
  landingDeg: number | null;
}

type Mutable = [number, number];

/** 반지름 r 인 원과 선분 a→b 의 교점 비율(0~1). a 가 원 안/밖에서 b 가 반대쪽이다. */
function crossAt(a: Vec2, b: Vec2, r: number): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const A = dx * dx + dy * dy;
  const B = 2 * (a[0] * dx + a[1] * dy);
  const C = a[0] * a[0] + a[1] * a[1] - r * r;
  const disc = Math.max(0, B * B - 4 * A * C);
  const s = Math.sqrt(disc);
  const t1 = (-B - s) / (2 * A);
  const t2 = (-B + s) / (2 * A);
  if (t1 >= 0 && t1 <= 1) return t1;
  return Math.min(1, Math.max(0, t2));
}

/**
 * 맨틀 한 구간을 걷는다 — 지표에 닿거나(`surface`) 핵에 닿을 때(`core`)까지.
 * 곡률은 `cross(d, p̂) / ρ` — 반지름 방향과 비스듬할수록 크고, 늘 지구 중심에서 멀어지는 쪽으로 돈다.
 */
function walkMantle(
  start: Vec2,
  dir: Vec2,
  rho: number,
  rc: number,
  points: Vec2[],
  cum: number[],
): { hit: 'surface' | 'core'; dir: Mutable } {
  const p: Mutable = [start[0], start[1]];
  const d: Mutable = [dir[0], dir[1]];
  for (let i = 0; i < TRACE_MAX_STEPS; i++) {
    const r = Math.hypot(p[0], p[1]);
    const turn = r > 0 ? ((d[0] * p[1] - d[1] * p[0]) / r) * (TRACE_STEP / rho) : 0;
    // cross(d, p) > 0 이면 반시계로 돌아야 중심에서 멀어진다(오른쪽 반에서 아래로 가던 파선이 오른쪽 위로 휜다).
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    const nd0 = d[0] * cos - d[1] * sin;
    const nd1 = d[0] * sin + d[1] * cos;
    const a: Vec2 = [p[0], p[1]];
    const b: Vec2 = [p[0] + d[0] * TRACE_STEP, p[1] + d[1] * TRACE_STEP];
    const rb = Math.hypot(b[0], b[1]);
    const last = cum[cum.length - 1]!;
    if (rb <= rc) {
      const f = crossAt(a, b, rc);
      points.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      cum.push(last + TRACE_STEP * f);
      return { hit: 'core', dir: d };
    }
    if (rb >= 1 && i > 0) {
      const f = crossAt(a, b, 1);
      points.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      cum.push(last + TRACE_STEP * f);
      return { hit: 'surface', dir: d };
    }
    points.push(b);
    cum.push(last + TRACE_STEP);
    p[0] = b[0];
    p[1] = b[1];
    d[0] = nd0;
    d[1] = nd1;
  }
  return { hit: 'surface', dir: d };
}

/** 경계에서 스넬 굴절. `normal` 은 새 매질 쪽을 향한 단위 법선, `ratio` = 새 속력 / 옛 속력. */
function refract(d: Vec2, normal: Vec2, ratio: number): Mutable {
  const cosI = d[0] * normal[0] + d[1] * normal[1];
  const tx = d[0] - cosI * normal[0];
  const ty = d[1] - cosI * normal[1];
  const tl = Math.hypot(tx, ty);
  const sinI = tl;
  const sinJ = Math.min(1, ratio * sinI);
  const cosJ = Math.sqrt(1 - sinJ * sinJ);
  if (tl < 1e-12) return [normal[0], normal[1]];
  return [cosJ * normal[0] + (sinJ * tx) / tl, cosJ * normal[1] + (sinJ * ty) / tl];
}

/**
 * 진원에서 출발각 `takeoff`(곧장 아래에서 오른쪽으로 잰 라디안)로 떠난 파선.
 * `throughCore` 가 거짓이면 핵에 닿는 자리에서 멈춘다(S파).
 */
export function traceRay(
  takeoff: number,
  model: Pick<RayModel, 'rho' | 'coreSpeedRatio'>,
  rc: number,
  throughCore: boolean,
): RayPath {
  const points: Vec2[] = [[0, 1]];
  const cum: number[] = [0];
  const first = walkMantle([0, 1], [Math.sin(takeoff), -Math.cos(takeoff)], model.rho, rc, points, cum);
  if (first.hit === 'surface') {
    return { points, cum, coreIn: -1, coreOut: -1, landingDeg: landing(points) };
  }
  const coreIn = points.length - 1;
  if (!throughCore) return { points, cum, coreIn, coreOut: -1, landingDeg: null };

  // 핵 속 — 곧은 선. 들어갈 때 · 나올 때 스넬 굴절.
  const pin = points[coreIn]!;
  const inward: Vec2 = [-pin[0] / rc, -pin[1] / rc];
  const dc = refract(first.dir, inward, model.coreSpeedRatio);
  const chord = -2 * (pin[0] * dc[0] + pin[1] * dc[1]);
  const pout: Vec2 = [pin[0] + dc[0] * chord, pin[1] + dc[1] * chord];
  points.push(pout);
  cum.push(cum[coreIn]! + chord);
  const coreOut = points.length - 1;
  const outward: Vec2 = [pout[0] / rc, pout[1] / rc];
  const dm = refract(dc, outward, 1 / model.coreSpeedRatio);

  walkMantle(pout, dm, model.rho, rc, points, cum);
  return { points, cum, coreIn, coreOut, landingDeg: landing(points) };
}

/** 마지막 점의 중심각(도) — 진원(맨 위)에서 시계 방향. */
function landing(points: Vec2[]): number {
  const p = points[points.length - 1]!;
  const a = Math.atan2(p[0], p[1]) / DEG;
  return a < 0 ? a + 360 : a;
}

/** 곡률 ρ 에서 외핵을 스치는 출발각 — 이보다 작으면 핵에 닿는다. */
function grazeTakeoffFor(rho: number, rc: number): number {
  let lo = 0;
  let hi = Math.PI / 2;
  for (let i = 0; i < SOLVE_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const hits = traceRay(mid, { rho, coreSpeedRatio: 1 }, rc, false).coreIn >= 0;
    if (hits) lo = mid;
    else hi = mid;
  }
  return hi;
}

/** 파선 모형을 선언에서 역산한다 (파일 머리 근사 1 · 2). */
export function solveRayModel(c: SeismicConstants): RayModel {
  const rc = c.coreRatio;

  // 1. ρ — 스치는 파선이 shadowFromDeg 에 닿도록. ρ 가 클수록(덜 휠수록) 멀리 닿는다.
  let lo = 0.6;
  let hi = 60;
  for (let i = 0; i < SOLVE_ITERATIONS; i++) {
    const mid = Math.sqrt(lo * hi);
    const g = grazeTakeoffFor(mid, rc);
    const land = traceRay(g + GRAZE_EPS, { rho: mid, coreSpeedRatio: 1 }, rc, false).landingDeg ?? 0;
    if (land > c.shadowFromDeg) hi = mid;
    else lo = mid;
  }
  const rho = Math.sqrt(lo * hi);
  const grazeTakeoff = grazeTakeoffFor(rho, rc);

  // 2. 핵 속력비 — 핵을 지난 P파가 닿는 가장 가까운 지표가 pShadowToDeg 가 되도록.
  //    비가 1 에 가까울수록 덜 꺾여 가깝게 닿는다.
  let nlo = 0.2;
  let nhi = 0.999;
  for (let i = 0; i < SOLVE_ITERATIONS; i++) {
    const mid = (nlo + nhi) / 2;
    let nearest = Infinity;
    for (let k = 0; k < CORE_SCAN_SAMPLES; k++) {
      const a = (grazeTakeoff * (k + 0.5)) / CORE_SCAN_SAMPLES;
      const d = traceRay(a, { rho, coreSpeedRatio: mid }, rc, true).landingDeg;
      if (d !== null && d < nearest) nearest = d;
    }
    if (nearest > c.pShadowToDeg) nlo = mid;
    else nhi = mid;
  }
  return { rho, coreSpeedRatio: (nlo + nhi) / 2, grazeTakeoff };
}

/** 파선 위 머리의 자리. */
export interface Head {
  /** 진원에서 잰 경로 길이. */
  s: number;
  /** 파선 끝에 닿았는가(지표든 핵이든). */
  done: boolean;
}

/**
 * 실제 시각 τ(초)에 파가 파선을 따라 간 길이. 맨틀은 `speed`, 핵은 `speed × coreSpeedRatio`.
 * `speed` 는 월드 단위 / 초(km/s ÷ 지구 반지름 km).
 */
export function headAt(ray: RayPath, tau: number, speed: number, coreSpeedRatio: number): Head {
  const total = ray.cum[ray.cum.length - 1]!;
  if (ray.coreOut < 0) {
    const s = speed * tau;
    return { s: Math.min(s, total), done: s >= total };
  }
  const l1 = ray.cum[ray.coreIn]!;
  const lc = ray.cum[ray.coreOut]! - l1;
  const t1 = l1 / speed;
  const tc = lc / (speed * coreSpeedRatio);
  let s: number;
  if (tau <= t1) s = speed * tau;
  else if (tau <= t1 + tc) s = l1 + (tau - t1) * speed * coreSpeedRatio;
  else s = l1 + lc + (tau - t1 - tc) * speed;
  return { s: Math.min(s, total), done: s >= total };
}

/** 경로 길이 s 까지 잘라 낸 폴리라인과 그 끝의 진행 방향(단위). */
export function cutAt(ray: RayPath, s: number): { points: Vec2[]; dir: Vec2 } {
  const out: Vec2[] = [ray.points[0]!];
  let dir: Vec2 = [0, -1];
  for (let i = 1; i < ray.points.length; i++) {
    const a = ray.points[i - 1]!;
    const b = ray.points[i]!;
    const ca = ray.cum[i - 1]!;
    const cb = ray.cum[i]!;
    const len = cb - ca;
    if (len > 0) dir = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    if (cb >= s) {
      const f = len > 0 ? (s - ca) / len : 0;
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      return { points: out, dir };
    }
    out.push(b);
  }
  return { points: out, dir };
}

/** 경로 길이 s 자리의 점과 진행 방향. */
export function pointAt(ray: RayPath, s: number): { p: Vec2; dir: Vec2 } {
  const cut = cutAt(ray, Math.max(0, s));
  return { p: cut.points[cut.points.length - 1]!, dir: cut.dir };
}

/** 쌓는 것이 없다 — 파선 모형은 `initialState` 가 풀고, 파의 자리는 시각의 함수다. */
export function step(params: { state: SeismicWavesState }): SeismicWavesState {
  return params.state;
}
