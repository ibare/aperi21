// ========================================================================
// angular-momentum — 순수 물리
// ========================================================================
// 끝점이 바닥에 고정된 무거운 대칭 팽이. 축 방향 단위 벡터 a 와 끝점에 대한
// 각운동량 L 을 함께 적분한다.
//
//   dL/dt = τ = a × (0, 0, −mgl)          무게가 만드는 돌림힘
//   ω⊥   = (L − (L·a) a) / I⊥             축에 수직인 몫만 축을 움직인다
//   da/dt = ω⊥ × a
//
// 제 축으로 도는 몫 L·a 는 돌림힘이 축에 수직이라 변하지 않는다 — 그래서 세 팽이를
// 가르는 수는 이것 하나다. 머리를 옆(+x)으로 친 충격은 L 에 (0, ΔL, 0) 을 더한다.
// 안 도는 팽이는 L 이 곧 ΔL 이라 축이 그대로 +x 로 넘어가고, 도는 팽이는 이미 가진
// L 에 견주어 ΔL 이 작을수록 축이 덜 기운다.
//
// 같은 시각은 언제나 같은 화면이다 — 충격 순간부터 지금 시각까지 고정 걸음으로 다시
// 적분한다. 누적 상태를 두지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CROWN_HEIGHT,
  DISC_HEIGHT,
  DISC_RADIUS,
  ELEV,
  GRAVITY_TORQUE,
  INERTIA_PERP,
  SPIN_FAST,
  SPIN_SLOW,
  SPIN_STILL,
  TAP_IMPULSE,
  YAW,
} from './schema';
import type { AngularMomentumState } from './state';

export type Vec3 = readonly [number, number, number];

export interface AngularMomentumConstants {
  /** 무게가 만드는 돌림힘 m·g·l. */
  gravityTorque: number;
  /** 끝점을 지나는 수직축 관성 모멘트. */
  inertiaPerp: number;
  /** 머리를 친 충격이 더하는 각운동량. */
  tapImpulse: number;
  /** 세 팽이가 제 축으로 도는 각운동량 — 안 돎 · 천천히 · 빠르게. */
  spins: readonly [number, number, number];
}

export function readConstants(stage: StageDef): AngularMomentumConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gravityTorque: c.gravityTorque ?? GRAVITY_TORQUE,
    inertiaPerp: c.inertiaPerp ?? INERTIA_PERP,
    tapImpulse: c.tapImpulse ?? TAP_IMPULSE,
    spins: [c.spinStill ?? SPIN_STILL, c.spinSlow ?? SPIN_SLOW, c.spinFast ?? SPIN_FAST],
  };
}

// ---- 벡터 ----

export const add3 = (a: Vec3, b: Vec3, s = 1): Vec3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
export const mul3 = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm3 = (a: Vec3): Vec3 => mul3(a, 1 / Math.hypot(a[0], a[1], a[2]));

/**
 * 고정 시점 투영. 월드 x 는 머리를 치는 방향, y 는 그와 직각인 수평, z 는 위.
 * 수직축으로 `YAW` 만큼 돌려 x · y 가 둘 다 화면 가로에 드러나게 하고, `ELEV` 만큼
 * 내려다본다(안쪽일수록 위로 올라 보인다). 3 차원 어휘가 없어 조각이 계산한다
 * (NOTES 「어휘 부족」 G55).
 */
export function project(p: Vec3): readonly [number, number] {
  const across = p[0] * Math.cos(YAW) + p[1] * Math.sin(YAW);
  const depth = -p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW);
  return [across, p[2] * Math.cos(ELEV) + depth * Math.sin(ELEV)];
}

/** 화면 쪽을 향하는 단위 벡터 — 원판 윗면이 보이는지 가른다. */
export const TO_VIEWER: Vec3 = [
  Math.sin(YAW) * Math.cos(ELEV),
  -Math.cos(YAW) * Math.cos(ELEV),
  Math.sin(ELEV),
];

/** 원판 테가 바닥에 닿는 기울기(rad). 쓰러진 팽이는 여기서 멈춰 눕는다. */
export const FALLEN_TILT = Math.atan2(DISC_HEIGHT, DISC_RADIUS);

// ---- 적분 ----

/** 적분 걸음(초). 빠른 팽이의 끄덕임 주기(약 0.16 초)를 여든 걸음 넘게 쪼갠다. */
const DT = 1 / 500;
/** 머리 자취를 남기는 간격(걸음 수)과 길이(초). */
const TRAIL_EVERY = 5;
const TRAIL_SECONDS = 1.1;

interface Rate {
  da: Vec3;
  dL: Vec3;
}

function rate(a: Vec3, L: Vec3, c: AngularMomentumConstants): Rate {
  const tau = cross3(a, [0, 0, -c.gravityTorque]);
  const wPerp = mul3(add3(L, a, -dot3(L, a)), 1 / c.inertiaPerp);
  return { da: cross3(wPerp, a), dL: tau };
}

export interface TopReading {
  /** 축 방향 단위 벡터(끝점 → 머리). */
  axis: Vec3;
  /** 곧게 선 자세에서 기운 각(rad). */
  tilt: number;
  /** 원판 테가 바닥에 닿아 누웠는가. */
  fallen: boolean;
  /** 최근 머리 자리들(3 차원, 오래된 것부터). 충격 전에는 비어 있다. */
  trail: Vec3[];
}

/**
 * 팽이 하나를 읽는다. 충격 시각은 선언이 정한다 — `end('tap')` 을 묻는다
 * (S-piece 「시간표는 선언이다」). 그 뒤 흐른 시간만큼 처음부터 다시 적분한다.
 */
export function readTop(tl: TimelineFrame, spin: number, c: AngularMomentumConstants): TopReading {
  const elapsed = Math.max(0, tl.u - tl.end('tap'));
  let a: Vec3 = [0, 0, 1];
  if (elapsed <= 0) return { axis: a, tilt: 0, fallen: false, trail: [] };

  // 충격 — 머리를 +x 로 친 각충격이 +y 방향으로 더해진다 (z × x = y).
  let L: Vec3 = [0, c.tapImpulse, spin];
  const steps = Math.floor(elapsed / DT);
  const keep = Math.ceil(TRAIL_SECONDS / (DT * TRAIL_EVERY));
  const trail: Vec3[] = [mul3(a, CROWN_HEIGHT)];
  let fallen = false;

  for (let i = 0; i < steps; i++) {
    const k1 = rate(a, L, c);
    const k2 = rate(norm3(add3(a, k1.da, DT / 2)), add3(L, k1.dL, DT / 2), c);
    const k3 = rate(norm3(add3(a, k2.da, DT / 2)), add3(L, k2.dL, DT / 2), c);
    const k4 = rate(norm3(add3(a, k3.da, DT)), add3(L, k3.dL, DT), c);
    const next = norm3([
      a[0] + (DT / 6) * (k1.da[0] + 2 * k2.da[0] + 2 * k3.da[0] + k4.da[0]),
      a[1] + (DT / 6) * (k1.da[1] + 2 * k2.da[1] + 2 * k3.da[1] + k4.da[1]),
      a[2] + (DT / 6) * (k1.da[2] + 2 * k2.da[2] + 2 * k3.da[2] + k4.da[2]),
    ]);
    L = [
      L[0] + (DT / 6) * (k1.dL[0] + 2 * k2.dL[0] + 2 * k3.dL[0] + k4.dL[0]),
      L[1] + (DT / 6) * (k1.dL[1] + 2 * k2.dL[1] + 2 * k3.dL[1] + k4.dL[1]),
      L[2] + (DT / 6) * (k1.dL[2] + 2 * k2.dL[2] + 2 * k3.dL[2] + k4.dL[2]),
    ];
    if (Math.acos(Math.min(1, next[2])) >= FALLEN_TILT) {
      // 원판 테가 바닥에 닿았다 — 그 방향 그대로 눕힌다.
      const h = Math.hypot(next[0], next[1]) || 1;
      a = [(next[0] / h) * Math.sin(FALLEN_TILT), (next[1] / h) * Math.sin(FALLEN_TILT), Math.cos(FALLEN_TILT)];
      trail.push(mul3(a, CROWN_HEIGHT));
      fallen = true;
      break;
    }
    a = next;
    if ((i + 1) % TRAIL_EVERY === 0) {
      trail.push(mul3(a, CROWN_HEIGHT));
      if (trail.length > keep) trail.shift();
    }
  }
  if (!fallen) trail.push(mul3(a, CROWN_HEIGHT));
  return { axis: a, tilt: Math.acos(Math.min(1, a[2])), fallen, trail };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 세운다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: AngularMomentumState }): AngularMomentumState {
  return params.state;
}
