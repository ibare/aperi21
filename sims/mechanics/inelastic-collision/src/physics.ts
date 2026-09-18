// ========================================================================
// inelastic-collision — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고, `step` 은 항등이다.
//
// 높이 h 에서 놓은 공, 바닥과의 반발 계수 e.
//
//   바닥에 닿는 빠르기      v₀ = √(2gh)
//   k 번째로 튀어 나가는 빠르기  u_k = e^k · v₀        (들어온 빠르기의 e 배)
//   k 번째 꼭짓점 높이      h_k = u_k² / 2g = e^{2k} · h   (앞 꼭짓점의 e² 배)
//   k 번째 충돌에서 사라진 몫   mg(h_{k−1} − h_k) = (1 − e²) · mg·h_{k−1}
//
//   떨어지는 시간 t₀ = √(2h/g), k 번째 튐의 체공 2u_k/g = 2e^k·t₀
//   튐을 멈추기까지 t₀ · (1 + 2e/(1 − e))  — 튐은 끝없이 이어지지만 시간의 합은 유한하다.
//
// 이 조각은 꼭짓점 높이의 줄(h_k)과 그 사이 모자란 만큼을 한 화면에 늘어놓는 것이 전부다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { APEX_KEYS, BALL_R, DRIFT_SPEED, DROP_HEIGHT, GRAVITY, RESTITUTION, RING_LIFE } from './schema';
import type { InelasticCollisionState } from './state';

export interface BounceConstants {
  /** 놓는 높이(m). */
  height: number;
  /** 반발 계수. */
  restitution: number;
  /** 중력 가속도(m/s²). */
  gravity: number;
  /** 옆으로 가는 빠르기(m/s). */
  drift: number;
}

export function readConstants(stage: StageDef): BounceConstants {
  const c = stage.constants ?? {};
  return {
    height: c.height ?? DROP_HEIGHT,
    restitution: c.restitution ?? RESTITUTION,
    gravity: c.gravity ?? GRAVITY,
    drift: c.drift ?? DRIFT_SPEED,
  };
}

/** 이 높이(놓은 높이에 대한 몫)보다 낮은 튐은 멈춘 것으로 본다. 화면에서 1 px 아래다. */
const REST_FRACTION = 1e-4;
/** 튐 수의 상한 — e 가 1 에 아주 가까운 선언에서도 목록이 끝나게 한다. */
const MAX_HOPS = 200;

/** 한 번의 튐. `k` 는 1 부터 — k 번째 충돌 뒤의 날아오름이다. */
export interface Hop {
  k: number;
  /** 튀어 나간 시각(= k 번째 착지 시각, 공의 시계). */
  t: number;
  /** 튀어 나가는 빠르기(m/s). */
  u: number;
  /** 꼭짓점 높이(공 밑면, m). */
  peak: number;
}

export interface Schedule {
  /** 바닥에 처음 닿는 빠르기. */
  v0: number;
  /** 떨어지는 시간. */
  t0: number;
  hops: readonly Hop[];
  /** 튐을 멈추는 시각. */
  settle: number;
}

/**
 * 튐 일정표 — 착지 시각 · 튀어 나가는 빠르기 · 꼭짓점. 간격이 매번 e 배로 짧아진다.
 * 선언할 자리가 없어 여기서 센다 (G80).
 */
export function schedule(c: BounceConstants): Schedule {
  const g = c.gravity;
  const e = c.restitution;
  const v0 = Math.sqrt(2 * g * c.height);
  const t0 = Math.sqrt((2 * c.height) / g);
  const hops: Hop[] = [];
  let t = t0;
  let u = v0;
  for (let k = 1; k <= MAX_HOPS; k++) {
    u *= e;
    const peak = (u * u) / (2 * g);
    if (peak < c.height * REST_FRACTION) break;
    hops.push({ k, t, u, peak });
    t += (2 * u) / g;
  }
  return { v0, t0, hops, settle: t };
}

/** 공의 시계 τ 에서 공 밑면의 높이와 세로 속도. 튐을 멈춘 뒤는 바닥에 선다. */
function heightAt(s: Schedule, c: BounceConstants, tau: number): { y: number; vy: number } {
  const g = c.gravity;
  if (tau < s.t0) return { y: c.height - 0.5 * g * tau * tau, vy: -g * tau };
  for (const hop of s.hops) {
    const dt = tau - hop.t;
    if (dt >= 0 && dt < (2 * hop.u) / g) {
      return { y: hop.u * dt - 0.5 * g * dt * dt, vy: hop.u - g * dt };
    }
  }
  return { y: 0, vy: 0 };
}

/** 공 중심의 월드 자리. 원점은 놓는 자리 바로 아래 바닥. */
function centerAt(s: Schedule, c: BounceConstants, tau: number): Vec2 {
  const { y } = heightAt(s, c, tau);
  return [c.drift * Math.min(tau, s.settle), Math.max(0, y) + BALL_R];
}

/** 이름표를 단 꼭짓점 하나. `k` 0 은 놓은 자리다. */
export interface Apex {
  k: number;
  /** 공 중심 자리(월드). */
  pos: Vec2;
}

/** 앞 꼭짓점 높이의 점선 — 앞 꼭짓점에서 오른쪽으로, 다음 꼭짓점(또는 지금 공)까지. */
export interface Level {
  k: number;
  from: Vec2;
  toX: number;
}

/** 한 번의 충돌 뒤 모자란 높이 — 앞 꼭짓점 높이에서 이번 꼭짓점까지. */
export interface Shortfall {
  k: number;
  x: number;
  fromY: number;
  toY: number;
}

export interface Reading {
  /** 공 중심. */
  ball: Vec2;
  /** 지나온 궤적(공 중심). */
  trail: readonly Vec2[];
  /** 지금까지 닿은 꼭짓점 — 이름표가 있는 것까지만. */
  apexes: readonly Apex[];
  levels: readonly Level[];
  shortfalls: readonly Shortfall[];
  /** 착지 파문 — 자리 · 나이(물리 초) · 세기(그 충돌에서 사라진 에너지에 비례, 첫 충돌이 1). */
  rings: readonly { pos: Vec2; age: number; strength: number }[];
  /** 첫 충돌 자리의 v · ev — 첫 착지 뒤에만. */
  firstImpact?: { x: number; vIn: number; vOut: number };
  /** 나타남 · 물러남(1 이면 또렷하다). */
  opacity: number;
}

/** 궤적 표본 간격(물리 초). 착지 순간은 따로 넣어 V 의 끝이 뭉개지지 않게 한다. */
const TRAIL_DT = 1 / 90;

/**
 * 시간표 진행도 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 공의 시계는 `fall` · `bounce` 두 단계의 진행도 × 길이의 합이다. 단계 경계를 상수로
 * 두지 않는다 — 시간표가 바뀌면 공의 시계가 따라온다.
 */
export function derive(tl: TimelineFrame, c: BounceConstants): Reading {
  const s = schedule(c);
  // 착지 시각 — k 번째 튐은 k 번째 착지에서 튀어 나간다. 튐이 하나도 없으면 첫 착지뿐이다.
  const landingTimes = s.hops.length > 0 ? s.hops.map((h) => h.t) : [s.t0];
  const tau = tl.at('fall') * tl.duration('fall') + tl.at('bounce') * tl.duration('bounce');
  const end = Math.min(tau, s.settle);

  // ---- 궤적 ----
  const trail: Vec2[] = [];
  const landings = landingTimes.filter((t) => t < end);
  let li = 0;
  for (let t = 0; t < end; t += TRAIL_DT) {
    while (li < landings.length && (landings[li] as number) <= t) {
      trail.push(centerAt(s, c, landings[li] as number));
      li++;
    }
    trail.push(centerAt(s, c, t));
  }
  trail.push(centerAt(s, c, end));

  // ---- 꼭짓점 · 앞 높이 점선 · 모자란 높이 ----
  const maxK = APEX_KEYS.length - 1;
  const apexes: Apex[] = [{ k: 0, pos: [0, c.height + BALL_R] }];
  for (const hop of s.hops) {
    if (hop.k > maxK) break;
    const tPeak = hop.t + hop.u / c.gravity;
    if (tau < tPeak) break;
    apexes.push({ k: hop.k, pos: [c.drift * tPeak, hop.peak + BALL_R] });
  }
  const ball = centerAt(s, c, tau);
  const levels: Level[] = [];
  const shortfalls: Shortfall[] = [];
  apexes.forEach((a, i) => {
    const next = apexes[i + 1];
    if (next) {
      levels.push({ k: a.k, from: a.pos, toX: next.pos[0] });
      shortfalls.push({ k: next.k, x: next.pos[0], fromY: a.pos[1], toY: next.pos[1] });
    } else if (a.k < maxK && tau < s.settle) {
      // 다음 꼭짓점을 기다리는 중 — 점선이 공을 따라 오른쪽으로 자란다.
      levels.push({ k: a.k, from: a.pos, toX: Math.max(a.pos[0], ball[0]) });
    }
  });

  // ---- 착지 파문 ----
  const e2 = c.restitution * c.restitution;
  const rings = landingTimes
    .map((t, j) => ({ t, j }))
    .filter(({ t }) => t <= tau && tau - t < RING_LIFE)
    .map(({ t, j }) => ({
      pos: [c.drift * t, 0] as Vec2,
      age: tau - t,
      // j 번째 충돌에서 사라진 에너지 = (1 − e²) · e^{2j} · mgh. 첫 충돌에 대한 몫.
      strength: Math.pow(e2, j),
    }));

  const first = s.hops[0];
  return {
    ball,
    trail,
    apexes,
    levels,
    shortfalls,
    rings,
    firstImpact: first && tau >= s.t0 ? { x: c.drift * s.t0, vIn: s.v0, vOut: first.u } : undefined,
    opacity: tl.at('appear') * (1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: InelasticCollisionState }): InelasticCollisionState {
  return params.state;
}
