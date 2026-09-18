// ========================================================================
// orbital-transfer — 순수 물리
// ========================================================================
// 우주선은 반시계 방향으로 돈다. 첫 밀기 자리는 낮은 원 궤도의 가장 아래 (0, −r₁), 두 번째 밀기
// 자리는 높은 원 궤도의 가장 위 (0, r₂) 다.
//
//   원 궤도 속도      v = √(GM/r)
//   전이 타원         a = (r₁ + r₂)/2,  e = (r₂ − r₁)/(r₂ + r₁)
//   가장 가까운 점    v_p = √(GM·(2/r₁ − 1/a))      Δv₁ = v_p − v₁
//   가장 먼 점        v_a = √(GM·(2/r₂ − 1/a))      Δv₂ = v₂ − v_a
//
// 전이 궤도 위 자리는 케플러 방정식 M = E − e·sin E 를 뉴턴 반복으로 풀어 얻는다. 시각은 낮은 원
// 궤도 한 바퀴(2π·√(r₁³/GM))를 `lowLapSeconds` 로 옮기는 한 배율로 모든 비행에 쓴다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다. 밀기 단계 동안 우주선은 멈춰 있다 — 밀기를 눈으로
// 보게 하는 느린 순간이고, 밀지 않은 쌍둥이도 같은 시계로 함께 멈춘다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_PER_SPEED,
  GM,
  INNER_RADIUS,
  LOW_LAP_SECONDS,
  OUTER_RADIUS,
  PLANET_RADIUS,
} from './schema';
import type { OrbitalTransferState } from './state';

export interface OrbitalTransferConstants {
  gm: number;
  innerRadius: number;
  outerRadius: number;
  planetRadius: number;
  lowLapSeconds: number;
  arrowPerSpeed: number;
}

export function readConstants(stage: StageDef): OrbitalTransferConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM,
    innerRadius: c.innerRadius ?? INNER_RADIUS,
    outerRadius: c.outerRadius ?? OUTER_RADIUS,
    planetRadius: c.planetRadius ?? PLANET_RADIUS,
    lowLapSeconds: c.lowLapSeconds ?? LOW_LAP_SECONDS,
    arrowPerSpeed: c.arrowPerSpeed ?? ARROW_PER_SPEED,
  };
}

/** 첫 밀기 자리의 각(가장 아래). */
export const BURN1_ANGLE = -Math.PI / 2;
/** 두 번째 밀기 자리의 각(가장 위). */
export const BURN2_ANGLE = Math.PI / 2;

/** 호 · 타원 표본 간격(rad). 1° — 원 · 타원이 각져 보이지 않는 촘촘함. */
const ARC_STEP = Math.PI / 180;
/** 케플러 방정식 뉴턴 반복 횟수. 이심률 0.4 대에서 충분히 수렴한다. */
const KEPLER_ITERATIONS = 10;

/** 속력과 자리 · 속도 벡터(물리 단위). */
export interface Kinematics {
  pos: Vec2;
  vel: Vec2;
}

/** 전이 궤도 요소와 네 속력. */
export interface Transfer {
  a: number;
  e: number;
  b: number;
  /** 평균 각속도(물리 단위). */
  n: number;
  v1: number;
  vp: number;
  va: number;
  v2: number;
  /** 물리 시간 1 이 화면에서 몇 초인가. */
  screenPerPhys: number;
  /** 전이 궤도 반 바퀴의 화면 시간(초). */
  halfScreen: number;
}

export function transferOf(c: OrbitalTransferConstants): Transfer {
  const r1 = c.innerRadius;
  const r2 = c.outerRadius;
  const a = (r1 + r2) / 2;
  const e = (r2 - r1) / (r2 + r1);
  const b = a * Math.sqrt(1 - e * e);
  const n = Math.sqrt(c.gm / (a * a * a));
  const screenPerPhys = c.lowLapSeconds / (2 * Math.PI * Math.sqrt((r1 * r1 * r1) / c.gm));
  return {
    a,
    e,
    b,
    n,
    v1: Math.sqrt(c.gm / r1),
    vp: Math.sqrt(c.gm * (2 / r1 - 1 / a)),
    va: Math.sqrt(c.gm * (2 / r2 - 1 / a)),
    v2: Math.sqrt(c.gm / r2),
    screenPerPhys,
    halfScreen: (Math.PI / n) * screenPerPhys,
  };
}

/** 반지름 r 인 원 위 각 θ 의 자리와 반시계 속도. */
export function onCircle(c: OrbitalTransferConstants, r: number, theta: number): Kinematics {
  const v = Math.sqrt(c.gm / r);
  return {
    pos: [r * Math.cos(theta), r * Math.sin(theta)],
    vel: [-v * Math.sin(theta), v * Math.cos(theta)],
  };
}

/**
 * 전이 타원 위 이심 근점 이각 E 의 자리와 속도. 가장 가까운 점이 아래(−y), 거기서 +x 로 떠난다.
 * 궤도면 좌표(x_p 가 가장 가까운 점 쪽)를 월드로 돌리면 (y_p, −x_p) 다.
 */
function onEllipse(tr: Transfer, E: number): Kinematics {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const xp = tr.a * (cosE - tr.e);
  const yp = tr.b * sinE;
  const Edot = tr.n / (1 - tr.e * cosE);
  const vxp = -tr.a * sinE * Edot;
  const vyp = tr.b * cosE * Edot;
  return { pos: [yp, -xp], vel: [vyp, -vxp] };
}

/** 가장 가까운 점을 떠난 뒤 화면 시간 s 의 이심 근점 이각. */
function eccentricAnomaly(tr: Transfer, s: number): number {
  const M = tr.n * (s / tr.screenPerPhys);
  let E = M;
  for (let i = 0; i < KEPLER_ITERATIONS; i++) {
    E -= (E - tr.e * Math.sin(E) - M) / (1 - tr.e * Math.cos(E));
  }
  return E;
}

/** 원 위 각 from → to 의 호(반시계). */
function arc(r: number, from: number, to: number): Vec2[] {
  const pts: Vec2[] = [];
  const n = Math.max(1, Math.ceil(Math.abs(to - from) / ARC_STEP));
  for (let i = 0; i <= n; i++) {
    const th = from + ((to - from) * i) / n;
    pts.push([r * Math.cos(th), r * Math.sin(th)]);
  }
  return pts;
}

/** 우주선이 지금 무엇을 하고 있는가. */
export type Leg = 'low' | 'burn1' | 'transfer' | 'burn2' | 'high';

export interface Ship extends Kinematics {
  leg: Leg;
  /** 이번 주기에 지나온 길(월드). */
  trail: Vec2[];
}

/** 단계 id 에서 그 단계가 시작한 뒤 흐른 화면 시간. 전에는 0, 뒤에는 단계 길이에서 멈춘다. */
function elapsed(tl: TimelineFrame, id: string): number {
  return Math.min(Math.max(tl.u - tl.start(id), 0), tl.duration(id));
}

/** 우주선의 지금 자리 · 속도 · 자취. */
export function shipAt(c: OrbitalTransferConstants, tr: Transfer, tl: TimelineFrame): Ship {
  const r1 = c.innerRadius;
  const r2 = c.outerRadius;
  const w1 = (2 * Math.PI) / c.lowLapSeconds;

  // 낮은 궤도: 단계가 끝나는 순간 첫 밀기 자리에 닿도록 거꾸로 센다.
  const lowStart = BURN1_ANGLE - w1 * tl.duration('low');
  const lowNow = BURN1_ANGLE - w1 * (tl.duration('low') - elapsed(tl, 'low'));
  const trail: Vec2[] = arc(r1, lowStart, lowNow);

  if (tl.u < tl.start('burn1')) {
    return { leg: 'low', trail, ...onCircle(c, r1, lowNow) };
  }
  if (tl.u < tl.start('transfer')) {
    return { leg: 'burn1', trail, ...onCircle(c, r1, BURN1_ANGLE) };
  }

  // 전이 타원: 반 바퀴를 넘기지 않는다 — 단계가 비행보다 길면 가장 먼 점에서 기다린다.
  const sTr = Math.min(elapsed(tl, 'transfer'), tr.halfScreen);
  const E = Math.min(eccentricAnomaly(tr, sTr), Math.PI);
  const nE = Math.max(1, Math.ceil(E / ARC_STEP));
  for (let i = 1; i <= nE; i++) trail.push(onEllipse(tr, (E * i) / nE).pos);

  if (tl.u < tl.start('burn2')) {
    return { leg: 'transfer', trail, ...onEllipse(tr, E) };
  }
  if (tl.u < tl.start('high')) {
    return { leg: 'burn2', trail, ...onEllipse(tr, Math.PI) };
  }

  // 높은 원 궤도: 두 번째 밀기 자리에서 같은 화면 배율로 돈다. 주기의 끝까지 계속 간다.
  const w2 = Math.sqrt(c.gm / (r2 * r2 * r2)) * (1 / tr.screenPerPhys);
  const highNow = BURN2_ANGLE + w2 * Math.max(0, tl.u - tl.start('high'));
  trail.push(...arc(r2, BURN2_ANGLE, highNow).slice(1));
  return { leg: 'high', trail, ...onCircle(c, r2, highNow) };
}

/**
 * 밀지 않은 쌍둥이 — 첫 밀기 순간에 갈라져 낮은 원 궤도를 계속 돈다. 우주선과 같은 시계라 두 번째
 * 밀기 동안 함께 멈춘다. 갈라지기 전에는 없다.
 */
export function twinAt(c: OrbitalTransferConstants, tl: TimelineFrame): Kinematics | null {
  if (tl.u < tl.start('transfer')) return null;
  const w1 = (2 * Math.PI) / c.lowLapSeconds;
  const since = elapsed(tl, 'transfer') + Math.max(0, tl.u - tl.start('high'));
  return onCircle(c, c.innerRadius, BURN1_ANGLE + w1 * since);
}

/** 밀기 단계의 진행도 0~1(이징 적용). 화살표가 이만큼 자랐다. */
export function burnProgress(tl: TimelineFrame, id: 'burn1' | 'burn2'): number {
  return tl.at(id);
}

/** 자취 · 쌍둥이 · 밀기 자국의 짙기 0~1. 마지막 단계에서 흐려지고 다음 주기에 새로 쌓인다. */
export function cycleOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: OrbitalTransferState }): OrbitalTransferState {
  return params.state;
}
