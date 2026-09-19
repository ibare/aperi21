// ========================================================================
// lorentz-force — 순수 물리 · 투영
// ========================================================================
// 쌓는 상태가 없다. v 의 방향 · 전하 부호가 모두 시간표 진행도의 함수이고,
// `step` 은 항등이다.
//
//   F = q · v × B     B 는 세계 z 로 고정. v 는 방위 φ · 수평면에서 세운 각 α 로 정해진다.
//                     |F| = |q| v B cos α (v 와 B 사이 각의 사인) — α = π/2 이면 0.
//
// 엔진에 3 차원 어휘가 없어(장부 G55) 조각이 고정 시점 투영을 계산해 투영 평면 좌표를
// 월드 좌표로 넘긴다. 투영식은 `angular-momentum-vector` 와 같은 꼴이다 — 다른 sim 을
// import 하지 않으므로(S-sim) 여기 다시 둔다. 시점 각은 스테이지 상수다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CHARGE,
  FIELD,
  FIELD_SCALE,
  FORCE_SCALE,
  SPEED,
  TILT_ANGLE,
  TILT_AZIMUTH,
  TURNS,
  VELOCITY_SCALE,
  VIEW_ELEV,
  VIEW_YAW,
} from './schema';
import type { LorentzForceState } from './state';

export type Vec3 = readonly [number, number, number];

export const add3 = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len3 = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const unit3 = (a: Vec3): Vec3 => {
  const l = len3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export interface LorentzForceConstants {
  charge: number;
  speed: number;
  field: number;
  velocityScale: number;
  fieldScale: number;
  forceScale: number;
  turns: number;
  tiltAngle: number;
  tiltAzimuth: number;
  viewYaw: number;
  viewElev: number;
}

export function readConstants(stage: StageDef): LorentzForceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    charge: c.charge ?? CHARGE,
    speed: c.speed ?? SPEED,
    field: c.field ?? FIELD,
    velocityScale: c.velocityScale ?? VELOCITY_SCALE,
    fieldScale: c.fieldScale ?? FIELD_SCALE,
    forceScale: c.forceScale ?? FORCE_SCALE,
    turns: c.turns ?? TURNS,
    tiltAngle: c.tiltAngle ?? TILT_ANGLE,
    tiltAzimuth: c.tiltAzimuth ?? TILT_AZIMUTH,
    viewYaw: c.viewYaw ?? VIEW_YAW,
    viewElev: c.viewElev ?? VIEW_ELEV,
  };
}

/** 고정 시점. 투영과 앞뒤 판정이 같은 두 각을 쓴다. */
export interface View {
  yaw: number;
  elev: number;
  /** 시선 쪽을 가리키는 단위 벡터 — 이것과의 내적이 클수록 보는 사람에게 가깝다. */
  towardViewer: Vec3;
}

export function viewOf(c: LorentzForceConstants): View {
  const { viewYaw: yaw, viewElev: elev } = c;
  return {
    yaw,
    elev,
    towardViewer: [Math.sin(yaw) * Math.cos(elev), Math.cos(yaw) * Math.cos(elev), Math.sin(elev)],
  };
}

/**
 * 고정 비스듬 시점 투영. 결과는 투영 평면 좌표 — y 가 위.
 *
 * **거울상이 아니어야 한다.** 화면 가로(→) × 화면 세로(↑) 가 시선 쪽(`towardViewer`)과 같게
 * 가로축을 골랐다(장부 G120). 반대로 고르면 v × B 가 화면에서 반대쪽을 가리켜, 모양은
 * 멀쩡한 채 오른손 규칙이 왼손 규칙이 된다 — 이 조각에서는 그것이 곧 틀린 주장이다.
 */
export function project(view: View, p: Vec3): Vec2 {
  const { yaw, elev } = view;
  const xr = -p[0] * Math.cos(yaw) + p[1] * Math.sin(yaw);
  const depth = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw);
  const yr = p[2] * Math.cos(elev) - depth * Math.sin(elev);
  return [xr, yr];
}

/** 방위 φ · 수평면에서 세운 각 α 의 단위 방향. */
export function direction(azimuth: number, elevation: number): Vec3 {
  const ce = Math.cos(elevation);
  return [ce * Math.cos(azimuth), ce * Math.sin(azimuth), Math.sin(elevation)];
}

/** 자기장 방향 — 세계 z. */
export const FIELD_DIR: Vec3 = [0, 0, 1];

export interface Reading {
  /** 지금 전하량(부호 포함). */
  charge: number;
  /** v 의 3 차원 표시 벡터(월드 길이). */
  v: Vec3;
  /** B 의 3 차원 표시 벡터. */
  b: Vec3;
  /** F = q v × B 의 3 차원 표시 벡터. v ∥ B 이면 0. */
  f: Vec3;
  /** 부호가 바뀌기 직전(양전하)의 F — `flip` 단계에 점선으로 남긴다. */
  fBefore: Vec3;
  /** |F| / (|q| v B) — v 와 B 사이 각의 사인. 0 이면 힘이 없다. */
  sinVB: number;
  /** 떠오르고 물러나는 정도(1 이면 또렷하다). */
  opacity: number;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 가 그 단계의 진행도를 준다.
 */
export function derive(tl: TimelineFrame, c: LorentzForceConstants): Reading {
  // 방위 — 도는 두 단계에서만 바뀐다. 바퀴 수가 정수라 단계 끝에서 `tiltAzimuth` 로 돌아온다.
  const azimuth = c.tiltAzimuth + 2 * Math.PI * c.turns * (tl.at('turn') + tl.at('negTurn'));
  // 수평면에서 세운 각 — 세웠다가 다시 눕힌다.
  const elevation = c.tiltAngle * (tl.at('tilt') - tl.at('untilt'));
  // 전하 부호 — `flip` 이 시작한 순간 바뀐다. 다음 주기에는 at 이 0 으로 돌아가 양전하다.
  const flipped = tl.at('flip') > 0 || tl.phase === 'flip';
  const charge = flipped ? -c.charge : c.charge;

  const vHat = direction(azimuth, elevation);
  const v = mul3(vHat, c.speed * c.velocityScale);
  const b = mul3(FIELD_DIR, c.field * c.fieldScale);
  const vxb = cross3(vHat, FIELD_DIR);
  const forceUnit = c.speed * c.field * c.forceScale;
  const f = mul3(vxb, charge * forceUnit);
  const fBefore = mul3(vxb, c.charge * forceUnit);

  const opacity = tl.at('appear') * (1 - tl.at('fade'));
  return { charge, v, b, f, fBefore, sinVB: len3(vxb), opacity };
}

export function step(params: { state: LorentzForceState }): LorentzForceState {
  return params.state;
}
