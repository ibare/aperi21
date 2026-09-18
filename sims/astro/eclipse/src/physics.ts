// ========================================================================
// eclipse — 순수 계산
// ========================================================================
// 상태는 비어 있다 — 모든 것이 시간표 진행도의 함수다. `step` 은 항등.
//
// 좌표 — 해를 왼쪽(−x)에 고정하고 지구와 함께 도는 틀. x 는 해 → 지구 방향, z 는 황도면의 수직(화면 위),
// y 는 화면 안쪽 깊이(+ 가 뒤). 햇빛은 +x 로 나란히 온다고 보고, 그림자 원뿔은 해의 겉보기 반지름만큼
// 좁아진다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DRIFT_A_HALF_MONTHS,
  DRIFT_B_HALF_MONTHS,
  DRIFT_C_HALF_MONTHS,
  EARTH_RADIUS,
  EARTH_X,
  HALF_MONTHS_PER_YEAR,
  INCLINATION_DEG,
  INCLINATION_SCALE,
  MOON_DISTANCE,
  MOON_RADIUS,
  SUN_ANGULAR_RADIUS_DEG,
} from './schema';
import type { EclipseState } from './state';

export function step(params: { state: EclipseState }): EclipseState {
  return params.state;
}

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface EclipseConstants {
  /** 달 궤도의 실제 기울기(도). */
  inclination: number;
  /** 그림 속 기울기 과장 배율. */
  inclinationScale: number;
  earthRadius: number;
  moonRadius: number;
  moonDistance: number;
  /** 해의 겉보기 반지름(도) — 그림자 원뿔의 반각. */
  sunAngularRadius: number;
  /** 사이 단계 `driftA` · `driftB` · `driftC` 가 지나는 반달 수. */
  driftAHalfMonths: number;
  driftBHalfMonths: number;
  driftCHalfMonths: number;
  /** 한 해의 반달 수 — 교점 각이 한 바퀴 도는 주기. */
  halfMonthsPerYear: number;
}

export function readConstants(stage: StageDef): EclipseConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    inclination: c.inclination ?? INCLINATION_DEG,
    inclinationScale: c.inclinationScale ?? INCLINATION_SCALE,
    earthRadius: c.earthRadius ?? EARTH_RADIUS,
    moonRadius: c.moonRadius ?? MOON_RADIUS,
    moonDistance: c.moonDistance ?? MOON_DISTANCE,
    sunAngularRadius: c.sunAngularRadius ?? SUN_ANGULAR_RADIUS_DEG,
    driftAHalfMonths: c.driftAHalfMonths ?? DRIFT_A_HALF_MONTHS,
    driftBHalfMonths: c.driftBHalfMonths ?? DRIFT_B_HALF_MONTHS,
    driftCHalfMonths: c.driftCHalfMonths ?? DRIFT_C_HALF_MONTHS,
    halfMonthsPerYear: c.halfMonthsPerYear ?? HALF_MONTHS_PER_YEAR,
  };
}

const DEG = Math.PI / 180;

// ------------------------------------------------------------------------
// 시간 — 단계 진행도의 합으로 지난 반달 수를 센다
// ------------------------------------------------------------------------

/**
 * 단계마다 지나는 반달(삭 → 보름, 보름 → 삭) 수. 삭 · 보름 단계는 반달 하나, 사이 단계는 스테이지 상수
 * (`driftAHalfMonths` · `driftBHalfMonths` · `driftCHalfMonths`)가 정한다. 합이 한 해 반달 수
 * (`halfMonthsPerYear`)와 같아야 주기 끝에서 달의 자리와 교점 각이 처음과 같아진다. 단계 길이는 시간표
 * 선언이 정한다 — 저작자가 한 단계를 늘이면 그 단계 동안 천천히 돈다.
 */
function halfMonthTable(c: EclipseConstants): readonly (readonly [string, number])[] {
  return [
    ['solarA', 1],
    ['lunarA', 1],
    ['driftA', c.driftAHalfMonths],
    ['solarMiss', 1],
    ['lunarMiss', 1],
    ['driftB', c.driftBHalfMonths],
    ['solarB', 1],
    ['lunarB', 1],
    ['driftC', c.driftCHalfMonths],
  ];
}

/** 주기 첫머리부터 지난 반달 수 0 ~ 한 해 반달 수. */
export function halfMonths(tl: TimelineFrame, c: EclipseConstants): number {
  let h = 0;
  for (const [id, n] of halfMonthTable(c)) h += n * tl.at(id);
  return h;
}

/**
 * 달의 위상각 φ — 0 이면 해 쪽(삭), π 면 해 반대쪽(보름). 첫 단계 가운데(반달 0.5)가 삭이다.
 * 단계 경계가 상현 · 하현이라 삭 · 보름 단계의 가운데에 삭 · 보름이 온다.
 */
export function moonPhaseAngle(h: number): number {
  return Math.PI * (h - 0.5);
}

/**
 * 해 방향에서 잰 승교점의 각 Ω. 해를 고정한 틀이라 우주에 고정된 교점선이 한 해에 한 바퀴 돈다.
 * 첫 삭 · 보름 사이(반달 1)에 0 — 교점선이 해 · 지구 선과 포개진 식 계절 한가운데다.
 * (교점선이 18.6 년 주기로 도는 것은 두지 않았다.)
 */
export function nodeAngle(h: number, c: EclipseConstants): number {
  return (2 * Math.PI * (h - 1)) / c.halfMonthsPerYear;
}

// ------------------------------------------------------------------------
// 기하
// ------------------------------------------------------------------------

/** 그림 속 궤도 기울기(라디안) = 실제 기울기 × 과장 배율. */
export function drawnInclination(c: EclipseConstants): number {
  return c.inclination * c.inclinationScale * DEG;
}

/** 그림자 원뿔의 반각 탄젠트. */
export function coneSlope(c: EclipseConstants): number {
  return Math.tan(c.sunAngularRadius * DEG);
}

/** 위상각 φ · 교점 각 Ω 에서 달의 3차원 자리 [x, y(깊이), z] — 지구 가운데 기준. */
export function moonOffset3(phi: number, omega: number, c: EclipseConstants): readonly [number, number, number] {
  const d = c.moonDistance;
  // 해 쪽이 −x 라 삭(φ = 0)에서 x = −d.
  return [-d * Math.cos(phi), d * Math.sin(phi), d * Math.sin(drawnInclination(c)) * Math.sin(phi - omega)];
}

/** 3차원 자리의 화면 투영(월드) — 옆에서 본다. 깊이는 버린다. */
export function projectMoon(o: readonly [number, number, number]): Vec2 {
  return [EARTH_X + o[0], o[2]];
}

export interface EclipseHits {
  /** 달 본그림자가 지구 표면에 닿는다. */
  solar: boolean;
  /** 달이 지구 본그림자에 (일부라도) 든다. */
  lunar: boolean;
  /** 일식 자리 — 달 그림자 축이 지구 표면(해 쪽)을 뚫는 곳의 투영. */
  solarSpot: Vec2;
}

/**
 * 3차원으로 판정한다. 투영에서는 달 그림자가 지구 앞뒤를 지나도 겹쳐 보이므로 투영으로 가르지 않는다.
 * 달 그림자 축은 달을 지나 +x 로 나란하고, 지구 그림자 축은 x 축이다.
 */
export function eclipseHits(o: readonly [number, number, number], c: EclipseConstants): EclipseHits {
  const [x, y, z] = o;
  const rho = Math.hypot(y, z); // 달과 x 축(해 · 지구 선) 사이 거리
  const k = coneSlope(c);
  const R = c.earthRadius;

  let solar = false;
  let spotX = -R;
  if (x < 0 && rho < R) {
    spotX = -Math.sqrt(R * R - rho * rho);
    const umbraAtSurface = c.moonRadius - (spotX - x) * k;
    solar = umbraAtSurface > 0;
  }

  let lunar = false;
  if (x > 0) {
    const umbraAtMoon = R - x * k;
    lunar = umbraAtMoon > 0 && rho < umbraAtMoon + c.moonRadius;
  }

  return { solar, lunar, solarSpot: [EARTH_X + spotX, z] };
}

// ------------------------------------------------------------------------
// 다각형 — 원판 · 원뿔 단면(삼각형)과 그 교집합. 가려진 자리를 칠하는 데 쓴다.
// ------------------------------------------------------------------------

/** 원판을 다각형으로(반시계). */
export function discPolygon(center: Vec2, r: number, n = 48): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * 반지름 r 인 천체가 +x 로 드리우는 본그림자 원뿔의 옆모습(삼각형, 반시계). 밑변은 천체에 접하는 두 점,
 * 꼭짓점은 가운데에서 r / sin(반각) 만큼 뒤.
 */
export function umbraTriangle(center: Vec2, r: number, c: EclipseConstants): Vec2[] {
  const a = Math.atan(coneSlope(c));
  const s = Math.sin(a);
  const cs = Math.cos(a);
  return [
    [center[0] + r * s, center[1] - r * cs],
    [center[0] + r / s, center[1]],
    [center[0] + r * s, center[1] + r * cs],
  ];
}

/** 볼록 다각형 둘의 교집합(Sutherland–Hodgman). 둘 다 반시계라야 한다. 없으면 빈 배열. */
export function clipConvex(subject: readonly Vec2[], clip: readonly Vec2[]): Vec2[] {
  let out: Vec2[] = subject.slice();
  for (let i = 0; i < clip.length && out.length > 0; i++) {
    const a = clip[i]!;
    const b = clip[(i + 1) % clip.length]!;
    const inside = (p: Vec2): boolean => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0;
    const cross = (p: Vec2, q: Vec2): Vec2 => {
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const ex = b[0] - a[0];
      const ey = b[1] - a[1];
      const t = (ex * (a[1] - p[1]) - ey * (a[0] - p[0])) / (ex * dy - ey * dx);
      return [p[0] + dx * t, p[1] + dy * t];
    };
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j]!;
      const q = input[(j + 1) % input.length]!;
      const pin = inside(p);
      const qin = inside(q);
      if (pin) out.push(p);
      if (pin !== qin) out.push(cross(p, q));
    }
  }
  return out;
}
