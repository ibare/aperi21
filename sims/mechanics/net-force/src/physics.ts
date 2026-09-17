// ========================================================================
// net-force — 순수 물리
// ========================================================================

import type { Vec2 } from '@aperi21/schema';
import { ACCEL_SCALE, CONFIGS, DOT_EVERY, MASS } from './schema';
import type { NetForceState } from './state';

export interface ForceSet {
  /** 세 힘(월드 벡터, 1 N = 1 단위). */
  forces: readonly [Vec2, Vec2, Vec2];
  /** 알짜힘. */
  net: Vec2;
  /** 가속도(월드 단위/s²). */
  accel: Vec2;
  /** 물체가 출발하는 자리. 사슬과 이동 전체가 화면 가운데에 오도록 잡는다. */
  start: Vec2;
}

const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const scale = (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s];

function toVec([m, deg]: readonly [number, number]): Vec2 {
  const a = (deg * Math.PI) / 180;
  return [m * Math.cos(a), m * Math.sin(a)];
}

/**
 * 조합 하나를 준비한다. `moveTime` 은 풀려난 뒤 주기가 끝날 때까지(초) — 원본처럼
 * 흐려지는 동안의 이동까지 넣어 경계 상자를 잰다.
 */
export function prepare(index: number, moveTime: number): ForceSet {
  const cfg = CONFIGS[((index % CONFIGS.length) + CONFIGS.length) % CONFIGS.length]!;
  const forces = [toVec(cfg[0]!), toVec(cfg[1]!), toVec(cfg[2]!)] as const;
  const net = add(add(forces[0], forces[1]), forces[2]);
  const accel = scale(net, ACCEL_SCALE / MASS);
  const travel = scale(accel, 0.5 * moveTime * moveTime);
  const offsets: Vec2[] = [[0, 0], forces[0], forces[1], forces[2], add(forces[0], forces[1]), net];
  const pts = offsets.concat(offsets.map((o) => add(o, travel)));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { forces, net, accel, start: [-cx, -cy] };
}

/** 풀려난 뒤 `tau` 초가 지난 물체의 자리. 풀려나기 전(`tau ≤ 0`)은 출발점. */
export function positionAt(set: ForceSet, tau: number): Vec2 {
  const s = Math.max(0, tau);
  return add(set.start, scale(set.accel, 0.5 * s * s));
}

/**
 * 같은 시간 간격 자리 점. 출발점 하나에서 시작해 풀려난 뒤 `DOT_EVERY` 초마다 하나씩.
 * 간격이 넓어지는 것이 빨라짐이고, 점이 놓인 직선이 운동 방향이다.
 */
export function strobeDots(set: ForceSet, tau: number): Vec2[] {
  const n = tau > 0 ? Math.floor(tau / DOT_EVERY + 1e-9) : 0;
  const out: Vec2[] = [];
  for (let k = 0; k <= n; k++) out.push(positionAt(set, k * DOT_EVERY));
  return out;
}

export function offset(a: Vec2, b: Vec2, u = 1): Vec2 {
  return add(a, scale(b, u));
}

/** 쌓는 상태가 없다 — 모든 것이 주기 안 시각의 함수다. */
export function step(params: { state: NetForceState }): NetForceState {
  return params.state;
}
