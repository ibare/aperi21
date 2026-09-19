// ========================================================================
// heat-engine — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 알갱이의 자리는 (주기 안 시각, 스테이지 상수)의 닫힌 함수다 —
// 알갱이 i 는 제 바퀴 단계가 시작한 뒤 i × grainLead 에 떠나 grainTravel 동안 경로를
// 따라가고, 닿으면 더미의 제 칸(줄 = 바퀴 번호, 칸 = 갈래 안 순번)에 머문다.
// 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BAND_SCALE,
  GRAIN,
  GRAIN_LEAD,
  GRAIN_TRAVEL,
  LAYOUT,
  Q_COLD,
  Q_HOT,
  TURN_PHASES,
  WORK,
} from './schema';
import type { HeatEngineState } from './state';

export interface HeatEngineConstants {
  /** 한 바퀴에 받는 열 · 내놓는 일 · 버리는 열. */
  qHot: number;
  work: number;
  qCold: number;
  /** 알갱이 하나가 나르는 열. */
  grain: number;
  /** 띠 굵기 배율(월드 단위 / 열 한 단위). */
  bandScale: number;
  /** 알갱이 출발 간격 · 가는 데 걸리는 시간(초). */
  grainLead: number;
  grainTravel: number;
}

export function readConstants(stage: StageDef): HeatEngineConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    qHot: c.qHot ?? Q_HOT,
    work: c.work ?? WORK,
    qCold: c.qCold ?? Q_COLD,
    grain: c.grain ?? GRAIN,
    bandScale: c.bandScale ?? BAND_SCALE,
    grainLead: c.grainLead ?? GRAIN_LEAD,
    grainTravel: c.grainTravel ?? GRAIN_TRAVEL,
  };
}

// ------------------------------------------------------------------------
// 띠 배치 — 굵기가 곧 열의 양이다
// ------------------------------------------------------------------------

export interface Bands {
  /** 받은 열 띠의 위 · 아래 끝(월드 y). 가운데가 0 이다. */
  top: number;
  bottom: number;
  /** 일 갈래의 굵기 — 받은 열 띠의 위쪽 몫이 기관에서 위로 꺾인다. */
  workWidth: number;
  /** 버린 열 갈래의 굵기 — 받은 열 띠의 아래쪽 몫이 그대로 오른쪽으로 간다. */
  coldWidth: number;
}

export function bands(c: HeatEngineConstants): Bands {
  const h = c.qHot * c.bandScale;
  return { top: h / 2, bottom: -h / 2, workWidth: c.work * c.bandScale, coldWidth: c.qCold * c.bandScale };
}

// ------------------------------------------------------------------------
// 알갱이
// ------------------------------------------------------------------------

/** 한 바퀴의 알갱이 수 — 받은 열 · 일을 알갱이 하나의 열로 나눈 개수. 화면에 수로 띄우지 않는다. */
export function grainCounts(c: HeatEngineConstants): { total: number; work: number; cold: number } {
  const total = Math.round(c.qHot / c.grain);
  const work = Math.round(c.work / c.grain);
  return { total, work, cold: total - work };
}

/**
 * 한 바퀴 안 i 번째 알갱이가 어느 갈래로 가는가. 일 갈래 몫을 출발 순서에 고르게 흩는다 —
 * 일 알갱이가 앞에 몰리면 「처음 몇 개만 일이 된다」 로 읽힌다. 순번은 갈래 안 칸 번호다.
 */
export function grainRoute(i: number, total: number, work: number): { toWork: boolean; slot: number } {
  const before = Math.floor((i * work) / total);
  const after = Math.floor(((i + 1) * work) / total);
  return after > before ? { toWork: true, slot: before } : { toWork: false, slot: i - after };
}

/** 더미 한 줄에 `count` 칸을 가운데 맞춰 놓을 때 칸 `slot` 의 x. */
function pileX(centerX: number, count: number, slot: number): number {
  return centerX + (slot - (count - 1) / 2) * LAYOUT.pileStep;
}

/** 알갱이 하나의 경로(폴리라인)와, 그 가운데 열이 일로 바뀌는 꺾임까지의 길이 몫. */
export function grainPath(
  c: HeatEngineConstants,
  row: number,
  toWork: boolean,
  slot: number,
): { points: Vec2[]; turnAt: number } {
  const b = bands(c);
  const n = grainCounts(c);
  const startX = LAYOUT.hot.maxX;

  if (toWork) {
    // 받은 열 띠의 위쪽 몫, 위에서부터 칸 순서대로. 맨 위 가닥이 가장 먼저(왼쪽에서) 꺾여야 가닥이 엇갈리지 않는다.
    const lane = b.workWidth / n.work;
    const y = b.top - (slot + 0.5) * lane;
    const x = -b.workWidth / 2 + (slot + 0.5) * lane;
    const bin = LAYOUT.workBin;
    const sx = pileX((bin.minX + bin.maxX) / 2, n.work, slot);
    const sy = bin.minY + LAYOUT.pileInset + row * LAYOUT.pileStep;
    const points: Vec2[] = [
      [startX, y],
      [x, y],
      [x, bin.minY],
      [sx, sy],
    ];
    return { points, turnAt: segmentShare(points, 1) };
  }

  // 받은 열 띠의 아래쪽 몫. 찬 열원 안에서 제 칸 위까지 가서 내려앉는다.
  const lane = b.coldWidth / n.cold;
  const y = b.bottom + b.coldWidth - (slot + 0.5) * lane;
  const box = LAYOUT.cold;
  const sx = pileX((box.minX + box.maxX) / 2, n.cold, slot);
  const sy = box.minY + LAYOUT.pileInset + row * LAYOUT.pileStep;
  const points: Vec2[] = [
    [startX, y],
    [sx, y],
    [sx, sy],
  ];
  return { points, turnAt: 1 };
}

/** 경로 앞 `segments` 마디의 길이가 전체 길이에서 차지하는 몫. */
function segmentShare(points: readonly Vec2[], segments: number): number {
  let head = 0;
  let total = 0;
  for (let k = 1; k < points.length; k++) {
    const len = Math.hypot(points[k]![0] - points[k - 1]![0], points[k]![1] - points[k - 1]![1]);
    total += len;
    if (k <= segments) head += len;
  }
  return total > 0 ? head / total : 1;
}

/** 폴리라인 위 길이 몫 `s`(0~1)의 자리. */
export function pointAlong(points: readonly Vec2[], s: number): Vec2 {
  const lens: number[] = [];
  let total = 0;
  for (let k = 1; k < points.length; k++) {
    const len = Math.hypot(points[k]![0] - points[k - 1]![0], points[k]![1] - points[k - 1]![1]);
    lens.push(len);
    total += len;
  }
  let d = Math.min(Math.max(s, 0), 1) * total;
  for (let k = 1; k < points.length; k++) {
    const len = lens[k - 1]!;
    if (d <= len || k === points.length - 1) {
      const u = len > 0 ? Math.min(d / len, 1) : 1;
      const a = points[k - 1]!;
      const z = points[k]!;
      return [a[0] + (z[0] - a[0]) * u, a[1] + (z[1] - a[1]) * u];
    }
    d -= len;
  }
  return points[points.length - 1]!;
}

export interface GrainReading {
  pos: Vec2;
  /** 기관에서 꺾여 일이 되었는가 — 모양이 네모로 바뀐다. */
  isWork: boolean;
  /** 찬 쪽 더미에 닿았는가 — 찬 열원과 함께 밀려나고 옅어진다. */
  inColdPile: boolean;
}

/**
 * 이번 주기에 떠난 알갱이 전부를 읽는다. 아직 떠나지 않은 알갱이는 뜨거운 열원 안에 있어 없다.
 *
 * 바퀴 단계의 시각은 `timeline` 에게 묻는다(`start`) — 저작자가 바퀴 단계를 늘이면 출발도 따라간다.
 * 알갱이마다 다른 출발 시각은 단계로 풀 수 없어 `grainLead` · `grainTravel` 을 스테이지 상수로 두고
 * `span` 으로 읽는다.
 */
export function readGrains(tl: TimelineFrame, c: HeatEngineConstants): GrainReading[] {
  const n = grainCounts(c);
  const out: GrainReading[] = [];
  TURN_PHASES.forEach((phase, row) => {
    const start = tl.start(phase);
    for (let i = 0; i < n.total; i++) {
      const depart = start + i * c.grainLead;
      const s = tl.span(depart, depart + c.grainTravel);
      if (s <= 0) continue;
      const route = grainRoute(i, n.total, n.work);
      const path = grainPath(c, row, route.toWork, route.slot);
      out.push({
        pos: pointAlong(path.points, s),
        isWork: route.toWork && s >= path.turnAt,
        inColdPile: !route.toWork && s >= 1,
      });
    }
  });
  return out;
}

/**
 * 기관 바퀴의 각(라디안). 한 바퀴 몫의 알갱이가 기관을 지나는 동안 시계 방향으로 한 바퀴 돈다 —
 * 바퀴 단계 구간을 알갱이가 열원에서 기관 한가운데까지 가는 시간만큼 늦춰 읽는다. 단계 구간 그대로
 * 돌리면 마지막 알갱이들이 서 버린 기관을 지나간다. 그 밖에는 서 있다.
 */
export function rotorAngle(tl: TimelineFrame, c: HeatEngineConstants): number {
  const lag = c.grainTravel * engineShare(c);
  let turns = 0;
  for (const phase of TURN_PHASES) turns += tl.span(tl.start(phase) + lag, tl.end(phase) + lag);
  return Math.PI / 2 - turns * Math.PI * 2;
}

/** 찬 쪽 첫 가닥에서 열원 → 기관 한가운데 길이가 전체 경로에서 차지하는 몫. */
function engineShare(c: HeatEngineConstants): number {
  const { points } = grainPath(c, 0, false, 0);
  let total = 0;
  for (let k = 1; k < points.length; k++) {
    total += Math.hypot(points[k]![0] - points[k - 1]![0], points[k]![1] - points[k - 1]![1]);
  }
  return total > 0 ? (0 - LAYOUT.hot.maxX) / total : 0;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: HeatEngineState }): HeatEngineState {
  return params.state;
}
