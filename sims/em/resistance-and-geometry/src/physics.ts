// ========================================================================
// resistance-and-geometry — 순수 물리
// ========================================================================
// 도선의 저항은 R = ρL/A, 같은 전압에서 전류는 I = V/R 이다. 도선 속 전하 운반자의
// 흐름 빠르기(유동 속도)는 I / (n q A) 이고 n · q 는 같은 재료라 같다 — 그래서 빠르기는
// V/(ρL) 에 비례해 **길이에만** 달리고, 단면적이 넓으면 같은 빠르기로 더 넓게 흐른다.
// 조각은 이 비를 그대로 쓴다: 빠르기 비 = 전류 비 × (기준 단면적 / 단면적), 레인 수 비 =
// 단면적 비. 흐른 거리는 빠르기 × 조각 시계라 닫힌 식이다 — 같은 시각은 언제나 같은 자리다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AREA_FACTOR,
  BASE_AREA,
  BASE_LANES,
  BASE_LENGTH,
  CARRIER_SPACING,
  COUNT_PER_LANE,
  LENGTH_FACTOR,
  PILE_PITCH_X,
  PILE_PITCH_Y,
  PILE_ROWS,
  RESISTIVITY,
  TRAIL_SECONDS,
  VOLTAGE,
} from './schema';
import type { ResistanceAndGeometryState } from './state';

export interface ResistanceAndGeometryConstants {
  voltage: number;
  resistivity: number;
  baseLength: number;
  baseArea: number;
  lengthFactor: number;
  areaFactor: number;
  carrierSpacing: number;
  baseLanes: number;
  countPerLane: number;
  trailSeconds: number;
  pileRows: number;
  pilePitchX: number;
  pilePitchY: number;
}

export function readConstants(stage: StageDef): ResistanceAndGeometryConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    resistivity: c.resistivity ?? RESISTIVITY,
    baseLength: c.baseLength ?? BASE_LENGTH,
    baseArea: c.baseArea ?? BASE_AREA,
    lengthFactor: c.lengthFactor ?? LENGTH_FACTOR,
    areaFactor: c.areaFactor ?? AREA_FACTOR,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    baseLanes: c.baseLanes ?? BASE_LANES,
    countPerLane: c.countPerLane ?? COUNT_PER_LANE,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    pileRows: c.pileRows ?? PILE_ROWS,
    pilePitchX: c.pilePitchX ?? PILE_PITCH_X,
    pilePitchY: c.pilePitchY ?? PILE_PITCH_Y,
  };
}

/** 도선 하나의 형태 — 길이(월드) · 단면적(두께, 월드). */
export interface WireShape {
  length: number;
  area: number;
}

/** 저항 R = ρL/A. */
export function resistanceOf(resistivity: number, shape: WireShape): number {
  return (resistivity * shape.length) / shape.area;
}

/** 같은 전압에서의 전류 I = V/R. */
export function currentOf(voltage: number, resistance: number): number {
  return voltage / resistance;
}

/** 레인 수 — 단면적에 비례. 레인 간격이 세 도선에서 같다(같은 재료 = 같은 촘촘함). */
export function lanesOf(c: ResistanceAndGeometryConstants, shape: WireShape): number {
  return Math.max(1, Math.round((c.baseLanes * shape.area) / c.baseArea));
}

/**
 * 기준 도선의 알갱이 빠르기(월드/초). 세는 단계 동안 레인 하나가 `countPerLane` 개를 내보내도록
 * 시간표의 세는 단계 길이에서 얻는다 — 세기가 끝났을 때 무더기가 정확한 정수가 된다.
 */
export function baseSpeed(c: ResistanceAndGeometryConstants, tl: TimelineFrame): number {
  return (c.countPerLane * pitchOf(c, c.baseLength)) / tl.duration('count');
}

/**
 * 도선의 알갱이 빠르기. 유동 속도 = I / (n q A) 이므로 기준에 대한 비는
 * (I / I₀) × (A₀ / A). 전류는 선언 전압 · 비저항 · 형태로 R = ρL/A 에서 계산한다.
 */
export function speedOf(
  c: ResistanceAndGeometryConstants,
  shape: WireShape,
  base: WireShape,
  tl: TimelineFrame,
): number {
  const iBase = currentOf(c.voltage, resistanceOf(c.resistivity, base));
  const i = currentOf(c.voltage, resistanceOf(c.resistivity, shape));
  return baseSpeed(c, tl) * (i / iBase) * (base.area / shape.area);
}

/** 레인 j 의 자리 어긋남(월드). 이웃 레인이 반 칸씩 엇갈려 알갱이가 격자로 읽힌다. */
export function laneShift(c: ResistanceAndGeometryConstants, lane: number): number {
  return (lane % 2) * (c.carrierSpacing / 2);
}

/**
 * 도선 안 알갱이 간격(월드). 도선 길이를 선언 간격에 가장 가깝게 나눠 떨어지게 한다 — 알갱이가
 * 출구에서 입구로 돌아갈 때 간격이 한 곳만 벌어지지 않게. 기본값(2.4 · 4.8 을 0.3 으로)은 정확히 떨어진다.
 */
export function pitchOf(c: ResistanceAndGeometryConstants, length: number): number {
  return length / Math.max(1, Math.round(length / c.carrierSpacing));
}

/** 레인 하나의 알갱이 자리 — 입구(왼쪽 끝)에서 잰 도선 안 거리 목록. */
export function laneOffsets(
  c: ResistanceAndGeometryConstants,
  length: number,
  speed: number,
  lane: number,
  t: number,
): number[] {
  const pitch = pitchOf(c, length);
  const n = Math.round(length / pitch);
  const head = speed * t + laneShift(c, lane);
  const out: number[] = [];
  for (let k = 0; k < n; k++) {
    const s = head + k * pitch;
    out.push(((s % length) + length) % length);
  }
  return out;
}

/**
 * 이번 주기의 세는 단계 동안 도선 끝을 지난 알갱이 수(모든 레인 합).
 *
 * 레인 j 의 알갱이는 흐른 거리 `speed · t + shift` 가 도선 안 간격의 배수를 넘을 때마다 하나씩 끝을
 * 지난다 — floor 의 차이가 그 수다. 세기가 끝난 뒤에는 (레인 수 × 빠르기 × 세는 길이 / 간격)의
 * 반올림을 쓴다. 기준 도선에서는 이것이 정확히 `countPerLane` × 레인 수라 부동소수 끝자리에
 * 무더기가 한 알 흔들리지 않는다. 세기 전에는 0.
 */
export function passedCount(
  c: ResistanceAndGeometryConstants,
  length: number,
  speed: number,
  lanes: number,
  tl: TimelineFrame,
): number {
  const pitch = pitchOf(c, length);
  const from = tl.start('count');
  const to = tl.end('count');
  if (tl.u < from) return 0;
  if (tl.u >= to) return Math.round((lanes * speed * (to - from)) / pitch);
  const t0 = tl.t - (tl.u - from);
  let total = 0;
  for (let j = 0; j < lanes; j++) {
    const shift = laneShift(c, j);
    total +=
      Math.floor((speed * tl.t + shift) / pitch) - Math.floor((speed * t0 + shift) / pitch);
  }
  return total;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ResistanceAndGeometryState }): ResistanceAndGeometryState {
  return params.state;
}
