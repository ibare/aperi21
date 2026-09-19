// ========================================================================
// capacitors-in-circuit — 순수 물리
// ========================================================================
// 축전기 하나(넓이 A · 간격 d)를 전지 V 에 곧바로 이으면 판 한 장에 Q 가 담긴다
// (표식 baseMarks 개).
//
//   병렬 — 두 축전기가 모두 V 를 받는다. 하나마다 Q, 합쳐 2Q. 두 판이 옆으로 붙으면
//          넓이 2A · 간격 d 인 축전기 하나와 같다.
//   직렬 — 두 축전기가 V 를 나눠 받는다. 하나마다 Q/2. 가운데 도체(아래 판 + 도선 +
//          위 판)는 두 면에 −Q/2 · +Q/2 를 띠고 전체로는 중성이다. 그 도체의 두께를
//          0 으로 줄이면 넓이 A · 간격 2d 인 축전기 하나와 같다 — 안쪽 면 사이 간격이
//          (2d + m) − m = 2d 로 그대로라 용량도 전하도 그대로다.
//
// 그래서 합치는 동안 전하 표식 수는 바뀌지 않는다. 모든 것이 시각의 함수라 쌓는
// 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { BASE_MARKS, CAPACITANCE, CAPACITOR_COUNT, PLATE_GAP, PLATE_LENGTH, VOLTAGE } from './schema';
import type { CapacitorsInCircuitState } from './state';

export interface CapacitorsInCircuitConstants {
  /** 전지 전압(V). 화면 표식으로만 쓴다. */
  voltage: number;
  /** 축전기 하나의 용량(μF). 도식의 값 글자로만 쓴다. */
  capacitance: number;
  /** 축전기 하나를 V 에 곧바로 이었을 때 판 한 장의 전하 표식 수(= Q). */
  baseMarks: number;
  /** 판 길이(넓이 A) · 판 간격 d (월드 단위). */
  plateLength: number;
  plateGap: number;
}

export function readConstants(stage: StageDef): CapacitorsInCircuitConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    capacitance: c.capacitance ?? CAPACITANCE,
    baseMarks: c.baseMarks ?? BASE_MARKS,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    plateGap: c.plateGap ?? PLATE_GAP,
  };
}

/** 판이 멈춰 있는 두 그림. 이름표(A · d · Q …)는 이때만 붙는다. */
export type Settled = 'two' | 'merged';

export interface JoinReading {
  /**
   * 합쳐진 정도 0~1. 0 = 떨어진 두 축전기, 1 = 합친 하나. 병렬에서는 두 축전기 사이
   * 빈 폭이, 직렬에서는 가운데 도체의 두께 · 짙기가 `1 − join` 을 따른다.
   */
  join: number;
  /** 판이 멈춰 있으면 그 그림, 움직이는 중이면 없다. */
  settled?: Settled;
}

/**
 * 합쳐진 정도를 읽는다. **단계 경계는 선언이 정한다** — 합치기와 가르기가 서로
 * 빼지는 꼴이라 분기 없이 한 식이다(이징도 선언의 `smooth`).
 */
export function readJoin(tl: TimelineFrame): JoinReading {
  const join = tl.at('merge') - tl.at('split');
  const settled: Settled | undefined =
    tl.phase === 'two' || tl.phase === 'merged' ? tl.phase : undefined;
  return { join, settled };
}

/** 병렬 축전기 하나의 판 한 장 전하 표식 수 — 둘 다 V 를 받으므로 Q 그대로다. */
export function parallelMarks(c: CapacitorsInCircuitConstants): number {
  return c.baseMarks;
}

/** 직렬 축전기 하나의 판 한 장 전하 표식 수 — V 를 축전기 수만큼 나눠 받는다. */
export function seriesMarks(c: CapacitorsInCircuitConstants): number {
  return c.baseMarks / CAPACITOR_COUNT;
}

/**
 * 판 위 전하 표식의 가로 자리(판 왼쪽 끝에서 잰 거리)와 짙기. 판을 표식 수만큼 칸으로
 * 나눈 칸 가운데에 놓는다. 표식 수가 정수가 아니면 마지막 표식을 소수부만큼 옅게 둔다.
 */
export function markLayout(marks: number, length: number): { x: number; opacity: number }[] {
  const out: { x: number; opacity: number }[] = [];
  if (marks <= 0) return out;
  const whole = Math.floor(marks);
  const frac = marks - whole;
  for (let i = 0; i < whole; i++) out.push({ x: ((i + 0.5) * length) / marks, opacity: 1 });
  if (frac > 0) out.push({ x: ((whole + 0.5) * length) / (whole + 1), opacity: frac });
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: CapacitorsInCircuitState }): CapacitorsInCircuitState {
  return params.state;
}
