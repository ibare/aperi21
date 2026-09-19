// ========================================================================
// ohms-law — 순수 물리
// ========================================================================
// 한 회로의 전류는 I = V / R 이고, 도선 위 전자 알갱이의 속력은 전류에 비례한다(간격은
// 두 회로가 같다). 전압은 시간표 단계 경계에서 한 칸씩 오르고 단계 안에서는 일정하므로,
// 알갱이가 흐른 거리는 단계마다 (속력 × 머문 시간)을 더한 것이다 — 닫힌 식이라 같은
// 시각은 언제나 같은 자리다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CARRIER_SPACING,
  FLOW_SPEED_PER_AMP,
  PLOT_AXIS_CURRENT,
  PLOT_AXIS_VOLTAGE,
  PLOT_WORLD_PER_AMP,
  PLOT_WORLD_PER_VOLT,
  RESISTANCE_LARGE,
  RESISTANCE_SMALL,
  TRAIL_SECONDS,
  VOLTAGE_1,
  VOLTAGE_2,
  VOLTAGE_3,
} from './schema';
import type { OhmsLawState } from './state';

export interface OhmsLawConstants {
  /** 단계 1 · 2 · 3 의 전압(V). 전지 칸 수가 단계 번호 + 1 이다. */
  voltages: readonly [number, number, number];
  resistanceSmall: number;
  resistanceLarge: number;
  flowSpeedPerAmp: number;
  carrierSpacing: number;
  trailSeconds: number;
  plotWorldPerVolt: number;
  plotWorldPerAmp: number;
  plotAxisVoltage: number;
  plotAxisCurrent: number;
}

export function readConstants(stage: StageDef): OhmsLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltages: [c.voltage1 ?? VOLTAGE_1, c.voltage2 ?? VOLTAGE_2, c.voltage3 ?? VOLTAGE_3],
    resistanceSmall: c.resistanceSmall ?? RESISTANCE_SMALL,
    resistanceLarge: c.resistanceLarge ?? RESISTANCE_LARGE,
    flowSpeedPerAmp: c.flowSpeedPerAmp ?? FLOW_SPEED_PER_AMP,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
    plotWorldPerVolt: c.plotWorldPerVolt ?? PLOT_WORLD_PER_VOLT,
    plotWorldPerAmp: c.plotWorldPerAmp ?? PLOT_WORLD_PER_AMP,
    plotAxisVoltage: c.plotAxisVoltage ?? PLOT_AXIS_VOLTAGE,
    plotAxisCurrent: c.plotAxisCurrent ?? PLOT_AXIS_CURRENT,
  };
}

/** 옴 법칙 — 전류(A). */
export function currentOf(voltage: number, resistance: number): number {
  return voltage / resistance;
}

/**
 * 지금 전압 단계 0 · 1 · 2. 단계 경계는 시간표 선언에서 읽는다 — `step2` 가 시작하면
 * 1, `step3` 가 시작하면 2. 3 단계의 전압은 직선 · 읽기 · 흐려짐까지 이어진다.
 */
export function voltageLevel(tl: TimelineFrame): 0 | 1 | 2 {
  if (tl.u >= tl.start('step3')) return 2;
  if (tl.u >= tl.start('step2')) return 1;
  return 0;
}

/** 이번 주기에 단계 k 의 점이 이미 찍혔는가 — 그 단계가 시작했으면 참. */
export function pointShown(tl: TimelineFrame, level: 0 | 1 | 2): boolean {
  return level <= voltageLevel(tl);
}

/**
 * 한 회로의 알갱이가 조각 시계 0 부터 흐른 거리(월드)를 고리 둘레로 접은 값.
 *
 * 단계 k 동안 속력은 `speeds[k]` 로 일정하다. 한 주기에 흐르는 거리 D 는
 * 1 단계 길이 × s₀ + 2 단계 길이 × s₁ + (주기 끝 − 3 단계 시작) × s₂ 이고,
 * 지금까지는 주기 번호 × D + 이번 주기에 흐른 몫이다. 주기 경계에서 전압이 3 칸에서
 * 1 칸으로 돌아가도 거리는 이어지므로 알갱이가 튀지 않는다.
 */
export function flowDistance(
  tl: TimelineFrame,
  speeds: readonly [number, number, number],
  loopLength: number,
): number {
  const s2 = tl.start('step2');
  const s3 = tl.start('step3');
  const s1 = tl.start('step1');
  const inPhase = (from: number, to: number): number => Math.max(0, Math.min(tl.u, to) - from);
  const thisCycle =
    speeds[0] * inPhase(s1, s2) + speeds[1] * inPhase(s2, s3) + speeds[2] * inPhase(s3, tl.period);
  const perCycle = speeds[0] * (s2 - s1) + speeds[1] * (s3 - s2) + speeds[2] * (tl.period - s3);
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

/**
 * 닫힌 폴리라인에서 호길이 구간 [a, b] 의 조각(0 ≤ a < b ≤ 둘레). 사이의 꼭짓점을 모두
 * 지나므로 모서리 · 지그재그를 그대로 따라간다.
 */
export function subPath(path: readonly Vec2[], lengths: readonly number[], a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a).pos];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  const total = lengths[lengths.length - 1]!;
  // 끝이 둘레와 같으면 첫 점으로 닫힌다 — pointAt 이 0 으로 접으므로 첫 점을 직접 쓴다.
  pts.push(b >= total ? path[0]! : pointAt(path, lengths, b).pos);
  return pts;
}

/**
 * 호길이 구간 [from, to](둘레를 넘나들 수 있다)를 둘레 안의 구간들로 펴고, 가려진 구간
 * `hidden`(둘레 안, 넘나들지 않음)을 뺀다. 알갱이 꼬리가 전지 속을 지나며 판 위에 그어지지 않게.
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

/**
 * 고리 위 알갱이 수. 둘레를 선언 간격에 가장 가깝게 나눠 떨어지게 한다 — 고리를
 * 한 바퀴 돌아 제자리로 올 때 간격이 한 곳만 벌어지지 않게.
 */
export function carrierCount(loopLength: number, spacing: number): number {
  return Math.max(1, Math.round(loopLength / spacing));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: OhmsLawState }): OhmsLawState {
  return params.state;
}
