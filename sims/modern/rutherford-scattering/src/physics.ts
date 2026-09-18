// ========================================================================
// rutherford-scattering — 순수 물리 · 배치 계산
// ========================================================================
// 쌓는 상태가 없다. 입자마다의 충돌 변수 · 쏜 시각은 (시드, 주기 번호)의 함수이고, 그 입자가
// 지금 어디 있는지는 쏜 뒤 흐른 시간의 함수다. `step` 은 항등이다.
//
// 척력 쿨롱 궤도 — 핵이 먼 초점에 있는 쌍곡선. a = d₀/2, 이심률 e = √(1 + (b/a)²).
//
//   근점 방향 좌표   p = a(cosh ξ + e),  q = b sinh ξ          (핵이 원점)
//   핵까지 거리      r = a(1 + e cosh ξ)
//   시간             t = (a / v∞)(e sinh ξ + ξ)               (dt/dξ = r / v∞)
//   꺾인 각          tan(θ/2) = a / b  —  b = (d₀/2)·cot(θ/2)
//
// 들어오는 점근선이 −x 쪽(핵에서 본 방향 π), 나가는 점근선이 θ 이므로 근점 방향은 그 이등분
// (π + θ)/2 다. b < 0 은 x 축에 대한 거울상이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ALPHA_SPEED,
  ANGLE_MARK_DEG,
  ATOM_RADIUS_FM,
  BEAM_HALF_WIDTH,
  CLOSEST_APPROACH_FM,
  PARTICLE_COUNT,
  RING_RADIUS,
  SEED,
  START_RADIUS,
  TARGET_MAGNIFICATION,
} from './schema';
import type { RutherfordScatteringState } from './state';

/** 쏘는 시각의 흔들림 — 고른 간격의 몇 분의 일까지 앞뒤로 흔드는가. 1 보다 작아 순서가 뒤집히지 않는다. */
const EMIT_JITTER = 0.8;
/** 시간식을 거꾸로 풀 때 ξ 를 찾는 범위 · 이분 횟수. r = START_RADIUS 에서도 |ξ| 는 6 을 넘지 않는다. */
const XI_LIMIT = 20;
const SOLVE_STEPS = 60;
/** b = 0 (정면)에서 쌍곡선이 직선으로 무너지는 것을 피하는 가장 작은 |b|(월드). 화면 차이는 없다. */
const MIN_IMPACT = 1e-6;
/** 주기 번호를 시드에 섞는 곱수(황금비 해시). */
const CYCLE_MIX = 0x9e3779b9;

export interface RutherfordConstants {
  seed: number;
  particleCount: number;
  beamHalfWidth: number;
  /** 월드 d₀ — 정면으로 온 입자가 가장 가까이 가는 거리. 표적 배율을 곱한 값이다. */
  closestApproach: number;
  alphaSpeed: number;
  /** 고리에 눈금 · 글자로 표시하는 방향(도). 화면 글자는 이 값의 문자열이다. */
  angleMarkDeg: number;
}

export function readConstants(stage: StageDef): RutherfordConstants {
  const c = stage.constants ?? {};
  const beamHalfWidth = c.beamHalfWidth ?? BEAM_HALF_WIDTH;
  const approachFm = c.closestApproachFm ?? CLOSEST_APPROACH_FM;
  const atomFm = c.atomRadiusFm ?? ATOM_RADIUS_FM;
  const magnification = c.targetMagnification ?? TARGET_MAGNIFICATION;
  return {
    seed: c.seed ?? SEED,
    particleCount: Math.max(1, Math.round(c.particleCount ?? PARTICLE_COUNT)),
    beamHalfWidth,
    closestApproach: beamHalfWidth * (approachFm / atomFm) * magnification,
    alphaSpeed: c.alphaSpeed ?? ALPHA_SPEED,
    angleMarkDeg: c.angleMarkDeg ?? ANGLE_MARK_DEG,
  };
}

// ------------------------------------------------------------------------
// 시드 난수 — 같은 (시드, 주기)는 언제나 같은 입자들을 낸다
// ------------------------------------------------------------------------

/** 시드 난수(mulberry32). 상태를 닫아 둔 생성기를 돌려준다. */
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

/** 한 주기에 쏘는 입자 하나. */
export interface Shot {
  /** 충돌 변수(월드) — 들어오는 선이 핵에서 위(+)나 아래(−)로 비껴 있는 거리. */
  b: number;
  /** 쏜 시각(주기 안 시각, 초). */
  emit: number;
  /** 가운데 칸(b = 0 을 덮는 칸)의 입자 — `near` 가 끝나는 순간 근점에 닿도록 쏜다. */
  closest: boolean;
}

/**
 * 주기 `cycle` 의 입자들. 순수 함수 — 시드 · 주기 번호 · 상수 · 시간표만으로 정해진다.
 *
 * 충돌 변수는 빔 폭을 입자 수만큼 고른 칸으로 나눠 칸마다 하나씩 뽑는다(층화 표본). 그래서 b 의
 * 분포가 고르고, 가운데 칸 하나가 언제나 핵 바로 앞을 겨눈다. 나머지는 섞은 순서대로 `pass` 단계에
 * 고르게 쏘고, 가운데 칸 입자는 `near` 단계가 끝나는 순간 근점에 닿도록 거꾸로 센 시각에 쏜다.
 */
export function drawCycle(tl: TimelineFrame, c: RutherfordConstants): Shot[] {
  const rand = mulberry32((c.seed ^ Math.imul(tl.cycle + 1, CYCLE_MIX)) >>> 0);
  const n = c.particleCount;
  const w = (2 * c.beamHalfWidth) / n;
  const mid = Math.floor((n - 1) / 2);
  const bs: number[] = [];
  for (let i = 0; i < n; i++) bs.push(-c.beamHalfWidth + (i + rand()) * w);

  const others: number[] = [];
  for (let i = 0; i < n; i++) if (i !== mid) others.push(i);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j]!, others[i]!];
  }

  const passStart = tl.start('pass');
  const passLen = tl.duration('pass');
  const shots: Shot[] = others.map((idx, k) => ({
    b: bs[idx]!,
    emit: passStart + (passLen * (k + 0.5 + (rand() - 0.5) * EMIT_JITTER)) / others.length,
    closest: false,
  }));
  const lone = orbitOf(bs[mid]!, c);
  shots.push({ b: bs[mid]!, emit: tl.end('near') - (timeAt(lone, 0) - timeAt(lone, lone.xiStart)), closest: true });
  return shots;
}

// ------------------------------------------------------------------------
// 쿨롱 쌍곡선
// ------------------------------------------------------------------------

export interface Orbit {
  /** 반장축 a = d₀/2. */
  a: number;
  e: number;
  /** |b|. */
  b: number;
  /** 위(+1) · 아래(−1)로 비껴 들어오는가. */
  side: number;
  /** 근점 방향 단위 벡터 · 그에 수직인 단위 벡터(b > 0 쪽 기준). */
  up: Vec2;
  uq: Vec2;
  /** 출발(r = START_RADIUS) · 고리 들어옴 · 고리 나감(r = RING_RADIUS)의 ξ. */
  xiStart: number;
  xiRingIn: number;
  xiRingOut: number;
  speed: number;
}

/** 거리 r 에 닿는 ξ(≥ 0). 근점보다 가까우면 0. */
function xiAtRadius(r: number, a: number, e: number): number {
  const ch = (r / a - 1) / e;
  return ch <= 1 ? 0 : Math.acosh(ch);
}

export function orbitOf(b: number, c: RutherfordConstants): Orbit {
  const a = c.closestApproach / 2;
  const bb = Math.max(MIN_IMPACT, Math.abs(b));
  const e = Math.sqrt(1 + (bb / a) ** 2);
  const theta = 2 * Math.atan(a / bb);
  const alpha = (Math.PI + theta) / 2;
  const up: Vec2 = [Math.cos(alpha), Math.sin(alpha)];
  const uq: Vec2 = [Math.sin(alpha), -Math.cos(alpha)];
  const ring = xiAtRadius(RING_RADIUS, a, e);
  return {
    a,
    e,
    b: bb,
    side: b < 0 ? -1 : 1,
    up,
    uq,
    xiStart: -xiAtRadius(START_RADIUS, a, e),
    xiRingIn: -ring,
    xiRingOut: ring,
    speed: c.alphaSpeed,
  };
}

/** 궤도 위 ξ 의 자리(월드). */
export function pointAt(o: Orbit, xi: number): Vec2 {
  const p = o.a * (Math.cosh(xi) + o.e);
  const q = o.b * Math.sinh(xi);
  const x = p * o.up[0] + q * o.uq[0];
  const y = p * o.up[1] + q * o.uq[1];
  return [x, o.side * y];
}

/** 궤도 위 ξ 에서 나아가는 방향(라디안, 월드 +x 에서 반시계). */
export function headingAt(o: Orbit, xi: number): number {
  const dp = o.a * Math.sinh(xi);
  const dq = o.b * Math.cosh(xi);
  const dx = dp * o.up[0] + dq * o.uq[0];
  const dy = dp * o.up[1] + dq * o.uq[1];
  return Math.atan2(o.side * dy, dx);
}

/** ξ 에 닿는 시각(초, 근점을 0 으로). */
function timeAt(o: Orbit, xi: number): number {
  return (o.a / o.speed) * (o.e * Math.sinh(xi) + xi);
}

/** 출발한 뒤 `age` 초 지난 ξ. 시간식은 ξ 에 대해 늘기만 해서 이분법으로 푼다. */
function xiAfter(o: Orbit, age: number): number {
  const target = timeAt(o, o.xiStart) + age;
  let lo = o.xiStart;
  let hi = XI_LIMIT;
  for (let i = 0; i < SOLVE_STEPS; i++) {
    const m = (lo + hi) / 2;
    if (timeAt(o, m) < target) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

/** 입자 하나의 지금 모습. */
export interface ShotView {
  shot: Shot;
  orbit: Orbit;
  /** 날아가는 중이면 지금 자리. 아직 안 쐈거나 고리에 닿았으면 없다. */
  pos?: Vec2;
  /** 고리 안에서 지나온 길의 ξ 범위(시작 · 끝). 아직 고리에 안 들어왔으면 없다. */
  trail?: readonly [number, number];
  /**
   * 고리를 지나 나갔으면 — 지난 자리 · 그때 나아가던 방향(라디안) · 지난 뒤 흐른 시간(초) ·
   * 지난 시각(주기 안).
   */
  hit?: { pos: Vec2; heading: number; age: number; at: number };
}

/** 이번 주기 입자들의 지금 모습. 주기 안 시각 `tl.u` 의 함수다. */
export function readShots(tl: TimelineFrame, c: RutherfordConstants): ShotView[] {
  return drawCycle(tl, c).map((shot) => {
    const orbit = orbitOf(shot.b, c);
    const age = tl.u - shot.emit;
    if (age < 0) return { shot, orbit };
    const hitAge = timeAt(orbit, orbit.xiRingOut) - timeAt(orbit, orbit.xiStart);
    if (age >= hitAge) {
      return {
        shot,
        orbit,
        trail: [orbit.xiRingIn, orbit.xiRingOut] as const,
        hit: {
          pos: pointAt(orbit, orbit.xiRingOut),
          heading: headingAt(orbit, orbit.xiRingOut),
          age: age - hitAge,
          at: shot.emit + hitAge,
        },
      };
    }
    const xi = xiAfter(orbit, age);
    return {
      shot,
      orbit,
      pos: pointAt(orbit, xi),
      ...(xi > orbit.xiRingIn ? { trail: [orbit.xiRingIn, xi] as const } : {}),
    };
  });
}

export function step(params: { state: RutherfordScatteringState }): RutherfordScatteringState {
  return params.state;
}
