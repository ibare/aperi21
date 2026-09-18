// ========================================================================
// rotational-kinetic-energy — 순수 물리
// ========================================================================
// 비탈 위 등감속 운동 하나뿐이다. 오르는 방향 감속은
//   미끄러지는 고리(돌지 않음, 얼음):  a = g sinθ
//   구르는 고리(미끄럼 없이):        a = g sinθ / (1 + k),  k = I / mR²
// 이고, 멈출 때까지 오른 높이는
//   미끄러짐  h  = v² / 2g            (½mv² 만 있다)
//   구름     (1 + k) · h             (½mv² + ½Iω² = (1 + k) · ½mv²)
// 이다. 고리는 k = 1 이라 두 배다.
//
// 고리 중심이 지나는 길은 바닥 위 반지름 높이의 가로선과, 비탈에서 반지름만큼 떨어진
// 평행선을 이은 꺾인 선이다. 꺾이는 자리를 `kink` 라 부르고 길이 s 는 거기서 잰다 —
// 비탈 위에서 중심이 오른 높이는 정확히 s · sinθ 다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { GRAVITY, INERTIA_FACTOR, RADIUS, SLOPE_DEG, SPEED } from './schema';
import type { RotationalKineticEnergyState } from './state';

export interface RotationalKineticEnergyConstants {
  /** 중력 가속도(m/s²). */
  gravity: number;
  /** 두 고리의 진입 속력(m/s). */
  speed: number;
  /** 비탈 기울기(라디안). */
  slope: number;
  /** 고리 반지름(m). */
  radius: number;
  /** 관성 계수 k = I / mR². */
  inertiaFactor: number;
}

export function readConstants(stage: StageDef): RotationalKineticEnergyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const slopeDeg = c.slopeDeg ?? SLOPE_DEG;
  return {
    gravity: c.gravity ?? GRAVITY,
    speed: c.speed ?? SPEED,
    slope: (slopeDeg * Math.PI) / 180,
    radius: c.radius ?? RADIUS,
    inertiaFactor: c.inertiaFactor ?? INERTIA_FACTOR,
  };
}

/** 어느 고리인가. 미끄러지는 고리는 돌지 않아 회전 몫이 0 이다. */
export type HoopKind = 'slide' | 'roll';

/** 이 고리의 관성 계수 — 돌지 않는 고리는 회전 몫이 없으니 0 으로 센다. */
function spinShare(kind: HoopKind, c: RotationalKineticEnergyConstants): number {
  return kind === 'roll' ? c.inertiaFactor : 0;
}

/** 미끄러지는 고리가 오르는 높이 h = v² / 2g. 높이 막대의 한 칸이다. */
export function slideHeight(c: RotationalKineticEnergyConstants): number {
  return (c.speed * c.speed) / (2 * c.gravity);
}

/**
 * 중심 길이 꺾이는 자리 — 발치(바닥과 비탈이 만나는 곳) 기준. 바닥 위 반지름 높이의
 * 가로선과 비탈에서 반지름만큼 떨어진 평행선이 만나는 곳이라 발치보다 조금 앞이다.
 */
export function kinkOffset(c: RotationalKineticEnergyConstants): Vec2 {
  const { radius: r, slope } = c;
  return [(-r * (1 / Math.cos(slope) - 1)) / Math.tan(slope), r];
}

export interface HoopReading {
  /** 중심 — 발치 기준 좌표. */
  center: Vec2;
  /** 길 위 속도(m/s). 양이면 오르는 쪽(오른쪽), 음이면 내려오는 쪽. */
  velocity: number;
  /** 지금 있는 길의 방향 단위 벡터(오르는 쪽). 바닥이면 [1, 0]. */
  tangent: Vec2;
  /** 고리 살의 각(라디안, 반시계 양). 미끄러지는 고리는 0 에 머문다. */
  spin: number;
  /** 이번 주기에서 지금까지 오른 가장 높은 높이(m) — 바닥 위 중심 높이 기준. */
  risen: number;
  /** 정점을 지났는가 — 정점 잔상과 높이 막대 글자를 걸 조건이다. */
  pastApex: boolean;
  /** 정점의 중심 · 살 각 — 잔상이 쓴다. */
  apexCenter: Vec2;
  apexSpin: number;
  /** 멈출 때까지 오르는 높이(m) = (1 + k) · h. */
  apexHeight: number;
  /** 이 고리의 관성 계수 — 오른 높이를 ½mv² 몫과 ½Iω² 몫으로 나누는 데 쓴다. */
  share: number;
}

/**
 * 고리 하나를 읽는다. **단계 경계는 선언이 정한다** — 들어오는 동안의 길이도, 오르기
 * 시작하는 시각도 `timeline` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 *
 * 들어오는 시간을 두 고리가 함께 쓰므로 둘은 **같은 순간** 비탈에 닿는다. 들어오는
 * 자리는 「남은 진입 시간 × 진입 속력」 으로 되짚는다. 정점 · 되돌아옴은 **물리**가
 * 정한다 — 단계 경계가 아니라 v / a 다.
 */
export function readHoop(
  tl: TimelineFrame,
  kind: HoopKind,
  c: RotationalKineticEnergyConstants,
): HoopReading {
  const k = spinShare(kind, c);
  const v = c.speed;
  const decel = (c.gravity * Math.sin(c.slope)) / (1 + k);
  const apexTime = v / decel;
  const apexS = (v * v) / (2 * decel);

  // 들어오는 동안 남은 시간 · 비탈에 닿은 뒤 흐른 시간. 둘 중 하나는 늘 0 이다.
  const remaining = tl.duration('enter') * (1 - tl.at('enter'));
  const tau = Math.max(0, tl.u - tl.end('enter'));

  // 길 위 거리 s(꺾이는 자리부터, 음이면 바닥 위)와 속도.
  let s: number;
  let velocity: number;
  if (tau <= 0) {
    s = -v * remaining;
    velocity = v;
  } else if (tau <= 2 * apexTime) {
    s = v * tau - 0.5 * decel * tau * tau;
    velocity = v - decel * tau;
  } else {
    // 발치로 되돌아와 처음 속력으로 바닥을 거꾸로 달린다.
    s = -v * (tau - 2 * apexTime);
    velocity = -v;
  }

  const kink = kinkOffset(c);
  const dir: Vec2 = [Math.cos(c.slope), Math.sin(c.slope)];
  const onSlope = s > 0;
  const center: Vec2 = onSlope
    ? [kink[0] + s * dir[0], kink[1] + s * dir[1]]
    : [kink[0] + s, kink[1]];
  // 미끄럼 없이 구르면 살이 길이 s / R 만큼 돈다(오른쪽으로 가면 시계 방향 = 음).
  const spinOf = (dist: number): number => (kind === 'roll' ? -dist / c.radius : 0);

  // 지금까지 오른 가장 높은 높이 — 정점을 지나면 정점 높이에 머문다. 내려오는 동안
  // 줄어들면 「얼마나 올랐나」 가 결과 화면에서 사라진다.
  const tUp = Math.min(tau, apexTime);
  const risen = (v * tUp - 0.5 * decel * tUp * tUp) * Math.sin(c.slope);

  return {
    center,
    velocity,
    tangent: onSlope ? dir : [1, 0],
    spin: spinOf(s),
    risen,
    pastApex: tau >= apexTime,
    apexCenter: [kink[0] + apexS * dir[0], kink[1] + apexS * dir[1]],
    apexSpin: spinOf(apexS),
    apexHeight: apexS * Math.sin(c.slope),
    share: k,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 들여보낸다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: RotationalKineticEnergyState }): RotationalKineticEnergyState {
  return params.state;
}
