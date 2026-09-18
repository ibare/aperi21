// ========================================================================
// angular-momentum-vector — 순수 물리 · 투영
// ========================================================================
// 쌓는 상태가 없다. 바퀴의 회전각 · 빠르기 · 축 기울기가 모두 시간표 진행도의
// 함수이고, `step` 은 항등이다.
//
//   L = I·ω · â      같은 바퀴라 I 가 그대로 — L 의 길이는 빠르기 ω 에 비례하고,
//                    방향은 축 â 위에서 ω 의 부호(감는 방향)가 고른다.
//
// 엔진에 3 차원 어휘가 없어(장부 G55) 조각이 고정 시점 투영을 계산해 투영 평면 좌표를
// 월드 좌표로 넘긴다. 투영 수식은 `gyroscopic-precession` 과 같은 꼴이다 — 다른 sim 을
// import 하지 않으므로(S-sim) 여기 다시 둔다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { ELEV, SPIN_RATE, TILT_ANGLE, TILT_AZIMUTH, YAW } from './schema';
import type { AngularMomentumVectorState } from './state';

export type Vec3 = readonly [number, number, number];

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * 고정 비스듬 시점 투영. 결과는 투영 평면 좌표 — y 가 위.
 *
 * **거울상이 아니어야 한다.** 화면 가로(→) × 화면 세로(↑) 가 시선 쪽(`TOWARD_VIEWER`)과 같게
 * 가로축을 골랐다. 반대로 고르면 그림이 거울에 비친 꼴이 되어 오른손 규칙이 왼손 규칙으로
 * 뒤집힌다 — 이 조각에서는 그것이 곧 틀린 주장이다.
 */
export function project(p: Vec3): Vec2 {
  const xr = -p[0] * Math.cos(YAW) + p[1] * Math.sin(YAW);
  const depth = p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW);
  const yr = p[2] * Math.cos(ELEV) - depth * Math.sin(ELEV);
  return [xr, yr];
}

/**
 * 시선 쪽을 가리키는 단위 벡터 — 투영 평면의 가로 · 세로와 직교한다. 이것과의 내적이
 * 양수인 점이 바퀴 중심보다 **앞**(보는 사람 쪽)이다. 앞뒤 겹침을 이것으로 가른다.
 */
export const TOWARD_VIEWER: Vec3 = [
  Math.sin(YAW) * Math.cos(ELEV),
  Math.cos(YAW) * Math.cos(ELEV),
  Math.sin(ELEV),
];

export interface AngularMomentumVectorConstants {
  /** 바퀴가 도는 빠르기(rad/s). */
  spinRate: number;
  /** 축을 기울이는 최대 각(rad). */
  tiltAngle: number;
}

export function readConstants(stage: StageDef): AngularMomentumVectorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    spinRate: c.spinRate ?? SPIN_RATE,
    tiltAngle: c.tiltAngle ?? TILT_ANGLE,
  };
}

/** 축과 축에 수직인 바퀴 면의 오른손 기저. `e1 × e2 = axis` — e1 에서 e2 로 도는 것이 + 감기다. */
export interface Frame3 {
  axis: Vec3;
  e1: Vec3;
  e2: Vec3;
}

/** 연직에서 `tilt` 만큼, 방위 `TILT_AZIMUTH` 쪽으로 기운 축. */
export function frameFor(tilt: number): Frame3 {
  const b = TILT_AZIMUTH;
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  return {
    axis: [st * Math.cos(b), st * Math.sin(b), ct],
    e1: [ct * Math.cos(b), ct * Math.sin(b), -st],
    e2: [-Math.sin(b), Math.cos(b), 0],
  };
}

/** 바퀴 면 위, 축에서 반지름 r · 각 φ 인 점. */
export function onWheel(f: Frame3, r: number, phi: number): Vec3 {
  return add3(mul3(f.e1, r * Math.cos(phi)), mul3(f.e2, r * Math.sin(phi)));
}

export interface Reading {
  /** 축 기울기(rad). */
  tilt: number;
  /** 감는 방향과 빠르기 — +1 은 축 방향으로 보아 반시계(오른손), −1 은 반대. 뒤집히는 동안 선형으로 지난다. */
  spin: number;
  /** 바퀴 회전각(rad). 빠르기의 적분 — 시각의 함수로 닫힌 꼴이다. */
  angle: number;
  /** 떠오르고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` · `start(id)` · `duration(id)` 가 그 단계의
 * 진행도와 자리를 준다.
 */
export function derive(tl: TimelineFrame, c: AngularMomentumVectorConstants): Reading {
  const w = c.spinRate;
  const tilt = c.tiltAngle * tl.at('tilt');

  // 뒤집힘 — `reverse` 는 선형 이징이라 진행도가 곧 흐른 비율이다.
  const p = tl.at('reverse');
  const spin = 1 - 2 * p;

  // 회전각 = ∫ω dt. 뒤집히기 전 w·u, 뒤집히는 동안 w·D·p(1−p) 가 더해지고, 그 뒤로는 −w 로 돈다.
  const r0 = tl.start('reverse');
  const d = tl.duration('reverse');
  const before = Math.min(tl.u, r0);
  const after = Math.max(0, tl.u - r0 - d);
  const angle = w * before + w * d * p * (1 - p) - w * after;

  const opacity = tl.at('appear') * (1 - tl.at('fade'));
  return { tilt, spin, angle, opacity };
}

export function step(params: { state: AngularMomentumVectorState }): AngularMomentumVectorState {
  return params.state;
}
