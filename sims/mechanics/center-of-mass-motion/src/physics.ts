// ========================================================================
// center-of-mass-motion — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 매 프레임 **던진 순간(0 초)부터 지금 시각까지 다시 적분한다.**
// 고정 걸음(1/240 초) RK4 라 같은 시각은 언제나 같은 값이다 — `step` 은 항등이다.
//
// 두 덩어리(질량 m₁ · m₂)를 질량 중심 R 과 상대 위치 r = x₂ − x₁ 로 나눠 푼다.
//
//   R(t) = R₀ + V₀·t + ½·g·t²              외력은 중력뿐 — 포물선. 내부 힘은 들어가지 않는다
//   μ·r'' = −k·(|r| − L)·r̂    (이어진 동안)   μ = m₁m₂/(m₁+m₂). 돌고 출렁이는 것은 전부 여기
//   r'  += Δ·r̂               (갈라지는 순간)   떼어 미는 힘 쌍의 충격량. R 에는 닿지 않는다
//   r'' = 0                   (갈라진 뒤)       서로 떨어졌으니 둘 사이의 힘은 없다
//
//   x₁ = R − (m₂/M)·r ,  x₂ = R + (m₁/M)·r
//
// 상대 운동에서 중력이 빠지는 것은 두 덩어리가 같은 g 로 떨어지기 때문이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  G,
  HEAVY_MASS,
  LAUNCH_VX,
  LAUNCH_VY,
  LIGHT_MASS,
  SPRING_K,
  SPRING_LENGTH,
  START_ANGLE,
  START_SPAN,
  START_SPIN,
} from './schema';
import type { CenterOfMassMotionState } from './state';

export interface CenterOfMassMotionConstants {
  g: number;
  heavyMass: number;
  lightMass: number;
  springLength: number;
  springK: number;
  launchVx: number;
  launchVy: number;
  startSpan: number;
  startAngle: number;
  startSpin: number;
}

export function readConstants(stage: StageDef): CenterOfMassMotionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    g: c.g ?? G,
    heavyMass: c.heavyMass ?? HEAVY_MASS,
    lightMass: c.lightMass ?? LIGHT_MASS,
    springLength: c.springLength ?? SPRING_LENGTH,
    springK: c.springK ?? SPRING_K,
    launchVx: c.launchVx ?? LAUNCH_VX,
    launchVy: c.launchVy ?? LAUNCH_VY,
    startSpan: c.startSpan ?? START_SPAN,
    startAngle: c.startAngle ?? START_ANGLE,
    startSpin: c.startSpin ?? START_SPIN,
  };
}

/** 적분 걸음(초). 고정 — 같은 시각은 언제나 같은 값이다. */
const DT = 1 / 240;
/** 자취에 남기는 표본 간격(걸음 수). 1/80 초마다 한 점. */
const SAMPLE_EVERY = 3;

/** 질량 중심 — 던진 순간의 위치(원점) · 속도만으로 정해진다. */
export function centerOfMass(t: number, c: CenterOfMassMotionConstants): Vec2 {
  return [c.launchVx * t, c.launchVy * t - 0.5 * c.g * t * t];
}

/** 미리 그어 두는 포물선 — 0 부터 `tEnd` 까지. */
export function parabola(tEnd: number, c: CenterOfMassMotionConstants, samples = 96): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= samples; i++) pts.push(centerOfMass((tEnd * i) / samples, c));
  return pts;
}

interface Rel {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** 이어진 동안의 상대 가속도 — 용수철 힘 하나. */
function springAcc(x: number, y: number, k: number, L: number): Vec2 {
  const d = Math.hypot(x, y) || 1e-9;
  const a = (-k * (d - L)) / d;
  return [a * x, a * y];
}

function rk4(s: Rel, dt: number, k: number, L: number): Rel {
  const a1 = springAcc(s.x, s.y, k, L);
  const x2 = s.x + (s.vx * dt) / 2;
  const y2 = s.y + (s.vy * dt) / 2;
  const vx2 = s.vx + (a1[0] * dt) / 2;
  const vy2 = s.vy + (a1[1] * dt) / 2;
  const a2 = springAcc(x2, y2, k, L);
  const x3 = s.x + (vx2 * dt) / 2;
  const y3 = s.y + (vy2 * dt) / 2;
  const vx3 = s.vx + (a2[0] * dt) / 2;
  const vy3 = s.vy + (a2[1] * dt) / 2;
  const a3 = springAcc(x3, y3, k, L);
  const x4 = s.x + vx3 * dt;
  const y4 = s.y + vy3 * dt;
  const vx4 = s.vx + a3[0] * dt;
  const vy4 = s.vy + a3[1] * dt;
  const a4 = springAcc(x4, y4, k, L);
  return {
    x: s.x + (dt / 6) * (s.vx + 2 * vx2 + 2 * vx3 + vx4),
    y: s.y + (dt / 6) * (s.vy + 2 * vy2 + 2 * vy3 + vy4),
    vx: s.vx + (dt / 6) * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]),
    vy: s.vy + (dt / 6) * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1]),
  };
}

export interface Reading {
  /** 지금 시각(던진 뒤 흐른 물리 시간, 초). */
  t: number;
  /** 질량 중심 · 무거운 덩어리 · 가벼운 덩어리의 지금 자리. */
  cm: Vec2;
  heavy: Vec2;
  light: Vec2;
  /** 0 초부터 지금까지 지나온 자리. */
  cmTrail: Vec2[];
  heavyTrail: Vec2[];
  lightTrail: Vec2[];
  /** 아직 용수철로 이어져 있는가. */
  joined: boolean;
  /** 떼어 미는 방향(무거운 → 가벼운, 단위 벡터). 갈라진 뒤에만 뜻이 있다. */
  pushDir: Vec2;
  /** 전체가 옅어지는 정도(1 이면 또렷하다). 처음에 떠오르고 끝에서 물러난다. */
  opacity: number;
}

/** 던진 순간 — `fly` 단계가 시작하는 주기 안 시각. 그 앞(`appear`)은 던지기 전이다. */
export function throwAt(tl: TimelineFrame): number {
  return tl.start('fly');
}

/** 한 주기에서 날아가는 시간 — 던진 순간부터 `fade` 가 끝날 때까지(초). */
export function flightTime(tl: TimelineFrame): number {
  return tl.end('fade') - throwAt(tl);
}

/**
 * 시간표 → 화면에 놓을 값들. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두지 않는다 — 던지는 순간은 `start('fly')`, 갈라지는 순간은
 * `start('split')`, 떠오르고 물러나는 정도는 `at('appear')` · `at('fade')` 가 준다.
 * **던진 뒤 흐른 물리 시간 = 주기 안 시각 − 던진 순간** 이다. 던지기 전(`appear`)은 0 에 머문다.
 */
export function derive(
  tl: TimelineFrame,
  c: CenterOfMassMotionConstants,
  push: number,
): Reading {
  const m1 = c.heavyMass;
  const m2 = c.lightMass;
  const M = m1 + m2;
  const mu = (m1 * m2) / M;
  const kOverMu = c.springK / mu;
  const t0 = throwAt(tl);
  const tSplit = tl.start('split') - t0;
  const t = Math.max(0, tl.u - t0);

  const cos0 = Math.cos(c.startAngle);
  const sin0 = Math.sin(c.startAngle);
  let s: Rel = {
    x: c.startSpan * cos0,
    y: c.startSpan * sin0,
    // 처음에는 도는 것만 — 반지름 방향 속도는 0. 늘어난 채로 출발해 출렁인다.
    vx: -c.startSpin * c.startSpan * sin0,
    vy: c.startSpin * c.startSpan * cos0,
  };

  const cmTrail: Vec2[] = [];
  const heavyTrail: Vec2[] = [];
  const lightTrail: Vec2[] = [];
  const record = (time: number, r: Rel): void => {
    const R = centerOfMass(time, c);
    cmTrail.push(R);
    heavyTrail.push([R[0] - (m2 / M) * r.x, R[1] - (m2 / M) * r.y]);
    lightTrail.push([R[0] + (m1 / M) * r.x, R[1] + (m1 / M) * r.y]);
  };

  // 이어진 동안 — 용수철을 적분한다.
  const tJoin = Math.min(t, tSplit);
  const n = Math.floor(tJoin / DT);
  record(0, s);
  for (let i = 1; i <= n; i++) {
    s = rk4(s, DT, kOverMu, c.springLength);
    if (i % SAMPLE_EVERY === 0) record(i * DT, s);
  }
  // 남은 조각 걸음.
  const rest = tJoin - n * DT;
  if (rest > 0) s = rk4(s, rest, kOverMu, c.springLength);

  const joined = t < tSplit;
  const d = Math.hypot(s.x, s.y) || 1e-9;
  const pushDir: Vec2 = [s.x / d, s.y / d];

  if (!joined) {
    // 갈라지는 순간 — 떼어 미는 힘 쌍의 충격량이 상대 속도에만 더해진다.
    const vx = s.vx + push * pushDir[0];
    const vy = s.vy + push * pushDir[1];
    const at = (time: number): Rel => ({
      x: s.x + vx * (time - tSplit),
      y: s.y + vy * (time - tSplit),
      vx,
      vy,
    });
    record(tSplit, s);
    const step = SAMPLE_EVERY * DT;
    for (let time = tSplit + step; time < t; time += step) record(time, at(time));
    s = at(t);
  }
  record(t, s);

  const R = centerOfMass(t, c);
  return {
    t,
    cm: R,
    heavy: [R[0] - (m2 / M) * s.x, R[1] - (m2 / M) * s.y],
    light: [R[0] + (m1 / M) * s.x, R[1] + (m1 / M) * s.y],
    cmTrail,
    heavyTrail,
    lightTrail,
    joined,
    pushDir,
    opacity: Math.min(tl.at('appear'), 1 - tl.at('fade')),
  };
}

/** 쌓는 상태가 없다 — 칩이 고른 세기만 들고 있다. */
export function step(params: { state: CenterOfMassMotionState }): CenterOfMassMotionState {
  return params.state;
}
