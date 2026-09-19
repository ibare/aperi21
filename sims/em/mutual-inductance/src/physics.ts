// ========================================================================
// mutual-inductance — 순수 물리
// ========================================================================
// 1차 전류 I₁ 은 `rise` 동안 0 에서 최댓값까지 곧게 오르고, `hold` 동안 일정하고,
// `fall` 동안 0 까지 곧게 내린다. 2차 코일을 꿰는 선속은 I₁ 에 비례하므로(비례 상수가
// 상호 인덕턴스 M), 2차 전압은 I₁ 이 바뀌는 빠르기에 M 을 곱한 것이다:
//   V₂ = M · dI₁/dt
// 올리는 동안 + 한 높이, 일정한 동안 0, 내리는 동안 − 한 높이다. 부호는 계기의 극을
// 올리는 동안 + 가 나오도록 이은 것이다(방향 논의는 `lenz-law` 의 몫, NOTES (b)).
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  ARROW_SCALE,
  CURRENT_MAX,
  CURRENT_SCALE,
  FIELD_LINES,
  GRAPH_SECONDS,
  MUTUAL,
  NEEDLE_DEG_PER_VOLT,
  SECONDS_TO_WORLD,
  VOLT_SCALE,
} from './schema';
import type { MutualInductanceState } from './state';

export interface MutualInductanceConstants {
  mutual: number;
  currentMax: number;
  currentScale: number;
  voltScale: number;
  secondsToWorld: number;
  graphSeconds: number;
  arrowScale: number;
  fieldLines: number;
  needleDegPerVolt: number;
}

export function readConstants(stage: StageDef): MutualInductanceConstants {
  const c = stage.constants ?? {};
  return {
    mutual: c.mutual ?? MUTUAL,
    currentMax: c.currentMax ?? CURRENT_MAX,
    currentScale: c.currentScale ?? CURRENT_SCALE,
    voltScale: c.voltScale ?? VOLT_SCALE,
    secondsToWorld: c.secondsToWorld ?? SECONDS_TO_WORLD,
    graphSeconds: c.graphSeconds ?? GRAPH_SECONDS,
    arrowScale: c.arrowScale ?? ARROW_SCALE,
    fieldLines: c.fieldLines ?? FIELD_LINES,
    needleDegPerVolt: c.needleDegPerVolt ?? NEEDLE_DEG_PER_VOLT,
  };
}

/** 구간 [from, to] 안에서 시각 time 의 곧은 진행도 0~1. */
function ramp(time: number, from: number, to: number): number {
  if (to <= from) return time >= to ? 1 : 0;
  return Math.min(1, Math.max(0, (time - from) / (to - from)));
}

/** 주기 안 시각 time 의 1차 전류(A). 시간표의 `rise` · `fall` 경계를 읽는다. */
export function primaryCurrentAt(time: number, tl: TimelineFrame, c: MutualInductanceConstants): number {
  const up = ramp(time, tl.start('rise'), tl.end('rise'));
  const down = ramp(time, tl.start('fall'), tl.end('fall'));
  return c.currentMax * (up - down);
}

/** 올리는 동안의 2차 전압(V) = M × 최댓값 ÷ 올리는 시간. */
export function riseVoltage(tl: TimelineFrame, c: MutualInductanceConstants): number {
  return (c.mutual * c.currentMax) / tl.duration('rise');
}

/** 내리는 동안의 2차 전압(V) = −M × 최댓값 ÷ 내리는 시간. */
export function fallVoltage(tl: TimelineFrame, c: MutualInductanceConstants): number {
  return -(c.mutual * c.currentMax) / tl.duration('fall');
}

/** 주기 안 시각 time 의 2차 전압(V). 1차 전류가 바뀌는 동안에만 0 이 아니다. */
export function secondaryVoltageAt(time: number, tl: TimelineFrame, c: MutualInductanceConstants): number {
  if (time >= tl.start('rise') && time < tl.end('rise')) return riseVoltage(tl, c);
  if (time >= tl.start('fall') && time < tl.end('fall')) return fallVoltage(tl, c);
  return 0;
}

/** 기록이 끝나는 시각 — `after` 가 끝나는 때. 그 뒤(`clear`)는 기록을 지운다. */
export function recordEnd(tl: TimelineFrame): number {
  return tl.end('after');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MutualInductanceState }): MutualInductanceState {
  return params.state;
}
