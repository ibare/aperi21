// ========================================================================
// parallel-plate-capacitor — 순수 물리
// ========================================================================
// 전지에 이은 평행판은 늘 Q = CV 이고 C ∝ A/d 다. 전압 V 가 그대로인 채 판이 움직이면
// 담긴 전하는 매 순간 넓이에 비례하고 간격에 반비례한다 — 전하 표식 수는
//   n = baseMarks × (A/A₀) × (d₀/d)
// 이다. 도선의 저항을 두지 않으므로 전하는 판의 기하를 곧바로 따라간다(충전 곡선은
// `rc-circuit` 의 몫이다). 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  AREA_MULTIPLE,
  BASE_GAP,
  BASE_MARKS,
  GAP_DIVISOR,
  PLATE_LENGTH,
  VOLTAGE,
} from './schema';
import type { ParallelPlateCapacitorState } from './state';

export interface ParallelPlateCapacitorConstants {
  /** 전지 전압(V). 화면 표식으로만 쓴다 — 한 주기 내내 같다. */
  voltage: number;
  /** 처음 간격 d(월드 단위) · 좁힐 때 나누는 수. */
  baseGap: number;
  gapDivisor: number;
  /** 처음 판 길이(월드 단위) · 넓힐 때 곱하는 수. */
  plateLength: number;
  areaMultiple: number;
  /** 처음 판 한 장의 전하 표식 수. */
  baseMarks: number;
}

export function readConstants(stage: StageDef): ParallelPlateCapacitorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    voltage: c.voltage ?? VOLTAGE,
    baseGap: c.baseGap ?? BASE_GAP,
    gapDivisor: c.gapDivisor ?? GAP_DIVISOR,
    plateLength: c.plateLength ?? PLATE_LENGTH,
    areaMultiple: c.areaMultiple ?? AREA_MULTIPLE,
    baseMarks: c.baseMarks ?? BASE_MARKS,
  };
}

/** 판이 멈춰 있는 세 그림. 이름표(d · d/2 · A · 2A · Q · 2Q)는 이때만 붙는다. */
export type Settled = 'base' | 'near' | 'wide';

export interface PlateReading {
  /** 지금 판 간격(월드 단위, 안쪽 면 사이). */
  gap: number;
  /** 지금 판 길이(월드 단위). */
  length: number;
  /** 판 한 장에 담긴 전하 — 표식 수로 센 연속값. 소수부는 마지막 표식의 짙기다. */
  marks: number;
  /**
   * 도선의 관례 전류 방향. +1 = 전지가 전하를 판으로 밀어 넣는 중(위 도선에서 판 쪽),
   * −1 = 판의 전하가 전지로 돌아가는 중, 0 = 흐르지 않는다.
   */
  flow: 1 | -1 | 0;
  /** 판이 멈춰 있으면 그 그림, 움직이는 중이면 없다. */
  settled?: Settled;
}

/**
 * 판을 읽는다. **단계 경계는 선언이 정한다** — 간격 · 넓이가 움직이는 정도를 시간표의
 * `at()` 에서 읽는다(이징도 선언의 `smooth`). 좁히기와 되돌리기, 넓히기와 줄이기가
 * 서로 빼지는 꼴이라 분기 없이 한 식이다.
 */
export function readPlates(tl: TimelineFrame, c: ParallelPlateCapacitorConstants): PlateReading {
  const narrowed = tl.at('close') - tl.at('open');
  const widened = tl.at('widen') - tl.at('narrow');
  const gapFactor = 1 - (1 - 1 / c.gapDivisor) * narrowed;
  const areaFactor = 1 + (c.areaMultiple - 1) * widened;

  const moving = tl.progress > 0 && tl.progress < 1;
  let flow: PlateReading['flow'] = 0;
  if (moving && (tl.phase === 'close' || tl.phase === 'widen')) flow = 1;
  if (moving && (tl.phase === 'open' || tl.phase === 'narrow')) flow = -1;

  const settled: Settled | undefined =
    tl.phase === 'base' || tl.phase === 'near' || tl.phase === 'wide' ? tl.phase : undefined;

  return {
    gap: c.baseGap * gapFactor,
    length: c.plateLength * areaFactor,
    marks: (c.baseMarks * areaFactor) / gapFactor,
    flow,
    settled,
  };
}

/**
 * 판 위 전하 표식의 가로 자리(판 왼쪽 끝에서 잰 거리)와 짙기.
 *
 * 온전한 표식 ⌊n⌋ 개는 판 길이를 n 칸으로 나눈 칸 가운데에 놓이고, 막 들어오는
 * 마지막 표식은 소수부만큼 짙다. 새 표식이 나타날 때 앞 표식들이 조금씩 자리를
 * 비켜 주므로 **자리가 튀지 않는다** — n 이 정수 k 를 지나는 순간 두 배치가 같다.
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
export function step(params: { state: ParallelPlateCapacitorState }): ParallelPlateCapacitorState {
  return params.state;
}
