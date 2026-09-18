// ========================================================================
// seasonal-sun-path — 순수 물리 · 배치 계산
// ========================================================================
// 태양은 하루 동안 천구의 북극을 축으로 적위 δ 인 원을 돈다. 관측 위도 φ 에서
// 시간각 H(정남 0, 서쪽 +)인 태양의 방향은 지평 좌표(동 x · 북 y · 천정 z)로
//   x = −cos δ sin H
//   y =  cos φ sin δ − sin φ cos δ cos H
//   z =  sin φ sin δ + cos φ cos δ cos H
// 이다. δ 만 다른 원들은 모두 같은 축에 수직이라 서로 나란하다.
//
// 해가 뜨고 지는 시간각 ±H₀ 는 z = 0 에서 cos H₀ = −tan φ tan δ, 낮 길이는 2H₀ 를
// 시간으로 바꾼 것이다. 남중 고도는 90° − φ + δ.
//
// 투영은 **돔을 남서쪽 위에서 내려다본 정사영**이다 — 방위로 `viewAzimuth` 만큼 돌린 뒤
// 시점 고도 `viewElevation` 으로 눕힌다. 돔의 윤곽은 반지름 R 의 위 반원, 지평선은
// 가로 R · 세로 R sin(시점 고도) 인 타원이 된다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DAY_HOURS,
  DOME_R,
  HOLD_PHASES,
  LATITUDE_DEG,
  TILT_DEG,
  VIEW_AZIMUTH_DEG,
  VIEW_ELEVATION_DEG,
} from './schema';
import type { SeasonalSunPathState } from './state';

const DEG = Math.PI / 180;

export interface SeasonalSunPathConstants {
  /** 관측 위도(도). */
  latitude: number;
  /** 자전축 경사(도). */
  tilt: number;
  /** 하루(시간). */
  dayHours: number;
  /** 시점 고도(도). */
  viewElevation: number;
  /** 시점 방위 — 정남에서 서쪽으로(도). */
  viewAzimuth: number;
}

export function readConstants(stage: StageDef): SeasonalSunPathConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    latitude: c.latitude ?? LATITUDE_DEG,
    tilt: c.tilt ?? TILT_DEG,
    dayHours: c.dayHours ?? DAY_HOURS,
    viewElevation: c.viewElevation ?? VIEW_ELEVATION_DEG,
    viewAzimuth: c.viewAzimuth ?? VIEW_AZIMUTH_DEG,
  };
}

// ------------------------------------------------------------------------
// 시간표 → 계절 · 하루 중 시각
// ------------------------------------------------------------------------

/** 머무는 계절마다의 적위 — 경사의 몇 배인가. 순서는 `HOLD_PHASES` 와 같다. */
const HOLD_DECL_SIGN: Record<(typeof HOLD_PHASES)[number], number> = {
  winter: -1,
  equinox: 0,
  summer: 1,
};

/** 계절의 적위(도). 옮기는 단계의 진행도만큼 경사를 더하고, `back` 에서 동지로 되돌린다. */
export function declination(tl: TimelineFrame, c: SeasonalSunPathConstants): number {
  return c.tilt * (-1 + tl.at('toEquinox') + tl.at('toSummer') - 2 * tl.at('back'));
}

/** 머무는 계절의 적위(도). */
export function holdDeclination(hold: (typeof HOLD_PHASES)[number], c: SeasonalSunPathConstants): number {
  return c.tilt * HOLD_DECL_SIGN[hold];
}

/**
 * 하루 중 진행도 0~1 (0 = 자정). 머무는 단계마다 하루를 돈다 — 끝난 단계는 1, 오지 않은 단계는
 * 0 이라 합의 소수부가 지금 머무는 단계의 진행도다. 옮기는 동안은 0(자정)이다.
 */
export function dayFraction(tl: TimelineFrame): number {
  let sum = 0;
  for (const id of HOLD_PHASES) sum += tl.at(id);
  return sum - Math.floor(sum);
}

/** 하루 중 진행도 → 시간각(라디안). 자정 −π, 정오 0, 다음 자정 +π. */
export function hourAngle(frac: number): number {
  return (2 * frac - 1) * Math.PI;
}

/** 이번 주기에 그 계절의 하루를 다 돌았는가 — 지나온 길로 남긴다. */
export function holdDone(tl: TimelineFrame, hold: (typeof HOLD_PHASES)[number]): boolean {
  return tl.at(hold) >= 1;
}

// ------------------------------------------------------------------------
// 하늘
// ------------------------------------------------------------------------

export type Vec3 = readonly [number, number, number];

/** 적위 δ · 시간각 H(라디안)인 태양의 방향 — 지평 좌표(동 · 북 · 천정) 단위 벡터. */
export function sunDir(declDeg: number, h: number, c: SeasonalSunPathConstants): Vec3 {
  const d = declDeg * DEG;
  const phi = c.latitude * DEG;
  return [
    -Math.cos(d) * Math.sin(h),
    Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(h),
    Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h),
  ];
}

/** 해 뜨는 · 지는 시간각의 크기 H₀(라디안). 늘 뜨거나 늘 지는 경우는 π · 0 으로 자른다. */
export function halfDayAngle(declDeg: number, c: SeasonalSunPathConstants): number {
  const x = -Math.tan(c.latitude * DEG) * Math.tan(declDeg * DEG);
  return Math.acos(Math.max(-1, Math.min(1, x)));
}

/** 낮 길이(시간). */
export function daylightHours(declDeg: number, c: SeasonalSunPathConstants): number {
  return (c.dayHours * halfDayAngle(declDeg, c)) / Math.PI;
}

/** 남중 고도(도). 막대 · 부채꼴 모양에만 쓰고 수로 띄우지 않는다. */
export function noonAltitude(declDeg: number, c: SeasonalSunPathConstants): number {
  return 90 - c.latitude + declDeg;
}

/** 지평 좌표 방향을 돔 위 자리(월드)로 — 방위를 돌리고 시점 고도로 눕힌 정사영. */
export function project(p: Vec3, c: SeasonalSunPathConstants, r: number = DOME_R): Vec2 {
  const psi = c.viewAzimuth * DEG;
  const e = c.viewElevation * DEG;
  const [x, y, z] = p;
  // 시점이 정남에서 서쪽으로 ψ 비낀 자리에 있으면, 장면을 +ψ 만큼 돌려 정남 시점으로 본다.
  const xr = x * Math.cos(psi) - y * Math.sin(psi);
  const yr = x * Math.sin(psi) + y * Math.cos(psi);
  return [r * xr, r * (yr * Math.sin(e) + z * Math.cos(e))];
}

/** 지평선 위 태양 길 — 해 뜰 때(−H₀)부터 질 때(+H₀)까지. */
export function dayArc(declDeg: number, c: SeasonalSunPathConstants, stepDeg: number): Vec2[] {
  const h0 = halfDayAngle(declDeg, c);
  const n = Math.max(2, Math.ceil((2 * h0) / (stepDeg * DEG)));
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) pts.push(project(sunDir(declDeg, -h0 + (2 * h0 * k) / n, c), c));
  return pts;
}

/** 지평선(방위 원) 위의 점 — 방위각 az(라디안, 북 0 · 동 +π/2)를 돔 반지름 배율 f 로. */
export function horizonPoint(az: number, c: SeasonalSunPathConstants, f: number = 1): Vec2 {
  return project([f * Math.sin(az), f * Math.cos(az), 0], c);
}

/** 지평선 타원. */
export function horizonRing(c: SeasonalSunPathConstants, stepDeg: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let a = 0; a < 360; a += stepDeg) pts.push(horizonPoint(a * DEG, c));
  return pts;
}

/** 돔의 윤곽 — 정사영에서 반구의 가장자리는 반지름 R 의 위 반원이다. */
export function domeOutline(stepDeg: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let a = 0; a <= 180; a += stepDeg) pts.push([DOME_R * Math.cos(a * DEG), DOME_R * Math.sin(a * DEG)]);
  return pts;
}

/** 남중 고도 부채꼴 — 자오선 평면에서 정남 지평선부터 남중 고도까지, 반지름 비 f. */
export function altitudeWedge(declDeg: number, c: SeasonalSunPathConstants, f: number, stepDeg: number): Vec2[] {
  const alt = noonAltitude(declDeg, c);
  const n = Math.max(2, Math.ceil(alt / stepDeg));
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const a = ((alt * k) / n) * DEG;
    pts.push(project([0, -f * Math.cos(a), f * Math.sin(a)], c));
  }
  return pts;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SeasonalSunPathState }): SeasonalSunPathState {
  return params.state;
}
