// ========================================================================
// emf-and-internal-resistance — 순수 물리
// ========================================================================
// 전지는 기전력 ε 와 내부 저항 r 의 묶음이다. 바깥 저항 R 을 이으면 전류는
// I = ε / (R + r), 단자 전압은 V = ε − I r 이다. 스위치가 열려 있으면 I = 0, V = ε.
//
// 도선 위 전자 알갱이의 속력은 전류에 비례한다. 바깥 저항은 시간표 단계 경계에서
// 바뀌고 단계 안에서는 일정하므로, 알갱이가 흐른 거리는 단계마다 (속력 × 머문 시간)을
// 더한 것이다 — 닫힌 식이라 같은 시각은 언제나 같은 자리다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CARRIER_SPACING,
  EMF,
  FLOW_SPEED_PER_AMP,
  INTERNAL_RESISTANCE,
  LOAD_1,
  LOAD_2,
  LOAD_3,
  PLOT_AXIS_CURRENT,
  PLOT_AXIS_VOLTAGE,
  PLOT_WORLD_PER_AMP,
  RESISTOR_WORLD_PER_OHM,
  TRAIL_SECONDS,
  WORLD_PER_VOLT,
} from './schema';
import type { EmfAndInternalResistanceState } from './state';

export interface EmfAndInternalResistanceConstants {
  emf: number;
  internalResistance: number;
  /** 단계 load1 · load2 · load3 의 바깥 저항(Ω). */
  loads: readonly [number, number, number];
  flowSpeedPerAmp: number;
  carrierSpacing: number;
  trailSeconds: number;
  worldPerVolt: number;
  plotWorldPerAmp: number;
  plotAxisCurrent: number;
  plotAxisVoltage: number;
  resistorWorldPerOhm: number;
}

export function readConstants(stage: StageDef): EmfAndInternalResistanceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    emf: c.emf ?? EMF,
    internalResistance: c.internalResistance ?? INTERNAL_RESISTANCE,
    loads: [c.load1 ?? LOAD_1, c.load2 ?? LOAD_2, c.load3 ?? LOAD_3],
    flowSpeedPerAmp: c.flowSpeedPerAmp ?? FLOW_SPEED_PER_AMP,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    worldPerVolt: c.worldPerVolt ?? WORLD_PER_VOLT,
    plotWorldPerAmp: c.plotWorldPerAmp ?? PLOT_WORLD_PER_AMP,
    plotAxisCurrent: c.plotAxisCurrent ?? PLOT_AXIS_CURRENT,
    plotAxisVoltage: c.plotAxisVoltage ?? PLOT_AXIS_VOLTAGE,
    resistorWorldPerOhm: c.resistorWorldPerOhm ?? RESISTOR_WORLD_PER_OHM,
  };
}

/**
 * 회로 상태 번호 — 0 은 스위치 열림, 1 · 2 · 3 은 바깥 저항 load1 · load2 · load3.
 * 단계 경계는 시간표 선언에서 읽는다. load3 은 직선 · 읽기 · 흐려짐까지 이어진다.
 */
export type Level = 0 | 1 | 2 | 3;

export function levelAt(tl: TimelineFrame): Level {
  if (tl.u >= tl.start('load3')) return 3;
  if (tl.u >= tl.start('load2')) return 2;
  if (tl.u >= tl.start('load1')) return 1;
  return 0;
}

/** 회로 상태의 바깥 저항(Ω). 스위치가 열리면 null. */
export function loadOf(c: EmfAndInternalResistanceConstants, level: Level): number | null {
  return level === 0 ? null : c.loads[level - 1]!;
}

/** 전류(A) — I = ε / (R + r). 스위치가 열리면 0. */
export function currentOf(c: EmfAndInternalResistanceConstants, level: Level): number {
  const r = loadOf(c, level);
  return r === null ? 0 : c.emf / (r + c.internalResistance);
}

/** 단자 전압(V) — V = ε − I r. */
export function terminalVoltage(c: EmfAndInternalResistanceConstants, current: number): number {
  return c.emf - current * c.internalResistance;
}

/**
 * 한 고리의 알갱이가 조각 시계 0 부터 흐른 거리(월드)를 고리 둘레로 접은 값.
 *
 * 상태 k 의 구간 동안 속력은 `speeds[k]` 로 일정하다. 열림(0) → load1 → load2 → load3
 * (주기 끝까지). 지금까지 흐른 거리는 주기 번호 × 한 주기 거리 + 이번 주기에 흐른 몫이다.
 * 주기 경계에서 스위치가 다시 열려도 거리는 이어지므로 알갱이가 튀지 않는다.
 */
export function flowDistance(
  tl: TimelineFrame,
  speeds: readonly [number, number, number, number],
  loopLength: number,
): number {
  const bounds = [tl.start('open'), tl.start('load1'), tl.start('load2'), tl.start('load3'), tl.period];
  const inPhase = (from: number, to: number): number => Math.max(0, Math.min(tl.u, to) - from);
  let thisCycle = 0;
  let perCycle = 0;
  for (let k = 0; k < 4; k++) {
    thisCycle += speeds[k]! * inPhase(bounds[k]!, bounds[k + 1]!);
    perCycle += speeds[k]! * (bounds[k + 1]! - bounds[k]!);
  }
  const wrapped = ((tl.cycle * perCycle) % loopLength) + thisCycle;
  return ((wrapped % loopLength) + loopLength) % loopLength;
}

/** 폴리라인 위 한 자리 — 점과 그 자리의 진행 방향(단위 벡터). */
export interface PathPoint {
  pos: Vec2;
  dir: Vec2;
}

/** 닫힌 폴리라인의 누적 호길이. 마지막 값이 둘레다(끝점 → 첫 점 변 포함). */
export function cumulativeLengths(path: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 0; i < path.length; i++) {
    const a = path[i]!;
    const b = path[(i + 1) % path.length]!;
    out.push(out[i]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return out;
}

/** 닫힌 폴리라인에서 호길이 s 의 자리. */
export function pointAt(path: readonly Vec2[], lengths: readonly number[], s: number): PathPoint {
  const total = lengths[lengths.length - 1]!;
  const t = ((s % total) + total) % total;
  let i = 0;
  while (i < path.length - 1 && lengths[i + 1]! <= t) i++;
  const a = path[i]!;
  const b = path[(i + 1) % path.length]!;
  const seg = lengths[i + 1]! - lengths[i]!;
  const f = seg > 0 ? (t - lengths[i]!) / seg : 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return { pos: [a[0] + dx * f, a[1] + dy * f], dir: [dx / len, dy / len] };
}

/** 닫힌 폴리라인에서 호길이 구간 [a, b] 의 조각(0 ≤ a < b ≤ 둘레). 사이의 꼭짓점을 모두 지난다. */
export function subPath(path: readonly Vec2[], lengths: readonly number[], a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a).pos];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  const total = lengths[lengths.length - 1]!;
  pts.push(b >= total ? path[0]! : pointAt(path, lengths, b).pos);
  return pts;
}

/**
 * 호길이 구간 [from, to](둘레를 넘나들 수 있다)를 둘레 안의 구간들로 펴고, 가려진 구간
 * `hidden`(둘레 안, 넘나들지 않음)을 뺀다. 알갱이 꼬리가 ε 칸 속을 지나며 판 위에 그어지지 않게.
 */
export function visibleArcs(
  from: number,
  to: number,
  total: number,
  hidden: readonly [number, number],
): [number, number][] {
  const a = ((from % total) + total) % total;
  const len = to - from;
  const spans: [number, number][] = a + len <= total ? [[a, a + len]] : [[a, total], [0, a + len - total]];
  const out: [number, number][] = [];
  for (const [s0, s1] of spans) {
    if (s0 < hidden[0]) out.push([s0, Math.min(s1, hidden[0])]);
    if (s1 > hidden[1]) out.push([Math.max(s0, hidden[1]), s1]);
  }
  return out.filter(([s0, s1]) => s1 - s0 > 1e-6);
}

/** 고리 위 알갱이 수. 둘레를 선언 간격에 가장 가깝게 나눠 떨어지게 한다. */
export function carrierCount(loopLength: number, spacing: number): number {
  return Math.max(1, Math.round(loopLength / spacing));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EmfAndInternalResistanceState }): EmfAndInternalResistanceState {
  return params.state;
}
