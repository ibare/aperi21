// ========================================================================
// geostationary-orbit — 순수 물리 · 배치 계산
// ========================================================================
// 원 궤도의 주기는 반지름과 지구의 GM 에서 나온다 — T = 2π √(r³ / GM).
// 지구는 항성일(rotationSeconds)에 한 바퀴 돈다. 하루 동안 위성이 도는 바퀴 수는
//
//   n = rotationSeconds / T
//
// 이고, 기지국(지구와 함께 도는 지표의 한 점)에서 본 위성의 자리 — 기지국 머리 위에서
// 동쪽으로 벌어진 각 — 는 하루에 (n − 1) 바퀴씩 변한다. n > 1 이면 앞질러 가고(낮은 위성),
// n < 1 이면 뒤처지며(높은 위성), n = 1 인 반지름에서만 제자리다(정지 위성). 그 반지름이
// 스테이지 상수로 따로 박혀 있지 않다 — 저작자가 geoRadiusKm 을 바꾸면 그 위성도 흘러간다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  EARTH_RADIUS_KM,
  GEO_RADIUS_KM,
  GEO_START_DEG,
  GM_KM3_S2,
  HIGH_RADIUS_KM,
  HIGH_START_DEG,
  LOW_RADIUS_KM,
  LOW_START_DEG,
  ROTATION_SECONDS,
  STATION_START_ANGLE,
} from './schema';
import type { GeostationaryOrbitState } from './state';

export interface GeostationaryOrbitConstants {
  /** GM (km³/s²). */
  gm: number;
  /** 지구가 한 바퀴 도는 시간(초). */
  rotationSeconds: number;
  earthRadiusKm: number;
  lowRadiusKm: number;
  geoRadiusKm: number;
  highRadiusKm: number;
  /** 첫 순간 기지국 머리 위에서 동쪽으로 벌어진 각(도). */
  lowStartDeg: number;
  geoStartDeg: number;
  highStartDeg: number;
}

export function readConstants(stage: StageDef): GeostationaryOrbitConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gm: c.gm ?? GM_KM3_S2,
    rotationSeconds: c.rotationSeconds ?? ROTATION_SECONDS,
    earthRadiusKm: c.earthRadiusKm ?? EARTH_RADIUS_KM,
    lowRadiusKm: c.lowRadiusKm ?? LOW_RADIUS_KM,
    geoRadiusKm: c.geoRadiusKm ?? GEO_RADIUS_KM,
    highRadiusKm: c.highRadiusKm ?? HIGH_RADIUS_KM,
    lowStartDeg: c.lowStartDeg ?? LOW_START_DEG,
    geoStartDeg: c.geoStartDeg ?? GEO_START_DEG,
    highStartDeg: c.highStartDeg ?? HIGH_START_DEG,
  };
}

/** 세 위성. 순서가 곧 그리는 순서다(정지 위성이 맨 위). */
export const SATELLITES = ['low', 'high', 'geo'] as const;
export type SatelliteId = (typeof SATELLITES)[number];

/** 한 주기의 단계 id — 하나가 지구 한 바퀴(하루)다. */
const DAYS = ['high', 'low', 'geo'] as const;

/** 이번 주기 첫머리부터 흐른 날 수 — 세 단계 진행도의 합. 단계 하나 = 지구 한 바퀴. */
export function elapsedDays(tl: TimelineFrame): number {
  let sum = 0;
  for (const id of DAYS) sum += tl.at(id);
  return sum;
}

export function radiusKm(id: SatelliteId, c: GeostationaryOrbitConstants): number {
  return id === 'low' ? c.lowRadiusKm : id === 'geo' ? c.geoRadiusKm : c.highRadiusKm;
}

function startRad(id: SatelliteId, c: GeostationaryOrbitConstants): number {
  const deg = id === 'low' ? c.lowStartDeg : id === 'geo' ? c.geoStartDeg : c.highStartDeg;
  return (deg * Math.PI) / 180;
}

/** 원 궤도 주기(초) — T = 2π √(r³ / GM). */
export function periodSeconds(rKm: number, c: GeostationaryOrbitConstants): number {
  return 2 * Math.PI * Math.sqrt((rKm * rKm * rKm) / c.gm);
}

/** 지구가 한 바퀴 도는 동안 위성이 도는 바퀴 수. */
export function lapsPerDay(id: SatelliteId, c: GeostationaryOrbitConstants): number {
  return c.rotationSeconds / periodSeconds(radiusKm(id, c), c);
}

/** 기지국의 각(라디안, 북극 위에서 반시계 = 자전 방향). */
export function stationAngle(days: number): number {
  return STATION_START_ANGLE + 2 * Math.PI * days;
}

/** 위성의 각(라디안) — 기지국과 같은 기준에서 잰다. */
export function satelliteAngle(id: SatelliteId, days: number, c: GeostationaryOrbitConstants): number {
  return STATION_START_ANGLE + startRad(id, c) + 2 * Math.PI * days * lapsPerDay(id, c);
}

/** 중심 · 반지름 · 각으로 원 위 점. */
export function onCircle(r: number, a: number): Vec2 {
  return [r * Math.cos(a), r * Math.sin(a)];
}

export interface SkyView {
  /** 기지국 지평선 위에 있는가 — 지구에 가리지 않고 이을 수 있는가. */
  visible: boolean;
  /** 머리 위에서 동쪽으로 벌어진 각(라디안). 동쪽이 +. */
  fromZenith: number;
}

/**
 * 기지국에서 본 위성의 방향. 기지국은 적도 위, 위성도 적도면이라 하늘은 반원 하나다.
 * 머리 위 = 지구 중심에서 기지국으로 가는 방향, 동쪽 = 자전 방향(반시계 접선).
 */
export function skyView(id: SatelliteId, days: number, c: GeostationaryOrbitConstants): SkyView {
  const phi = stationAngle(days);
  const [sx, sy] = onCircle(c.earthRadiusKm, phi);
  const [px, py] = onCircle(radiusKm(id, c), satelliteAngle(id, days, c));
  const dx = px - sx;
  const dy = py - sy;
  const up = dx * Math.cos(phi) + dy * Math.sin(phi);
  const east = -dx * Math.sin(phi) + dy * Math.cos(phi);
  return { visible: up > 0, fromZenith: Math.atan2(east, up) };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: GeostationaryOrbitState }): GeostationaryOrbitState {
  return params.state;
}
