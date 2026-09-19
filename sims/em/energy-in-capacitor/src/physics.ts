// ========================================================================
// energy-in-capacitor — 순수 물리
// ========================================================================
// 판에 q 가 담겨 있으면 판 전압은 v = q/C 이고, 그래서 V–Q 는 원점을 지나는 직선이다.
//
// 몫 하나(Δq)를 아래 판에서 위 판으로 옮길 때, 판 넓이만큼 퍼진 그 몫이 받는 힘은
// 몫 아래(이미 담긴 전하 + 방금 떠난 몫이 남긴 −Δq)와 몫 위(이미 담긴 전하)의 장의
// **평균**이다. 그래서 k 번째 몫에 드는 일은
//   ΔW_k = Δq × (v_k + v_{k+1}) / 2
// 로, V–Q 직선 아래 q_k ~ q_{k+1} 띠(윗변이 직선인 사다리꼴)의 넓이와 **정확히** 같다.
// 띠를 다 모으면 직선 아래 삼각형, ½QV 가 된다 — 근사가 아니다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CAPACITANCE,
  CHUNKS,
  FINAL_VOLTAGE,
  FORCE_ARROW_PER_VOLT,
  PLATE_GAP,
} from './schema';
import type { EnergyInCapacitorState } from './state';

export interface EnergyInCapacitorConstants {
  /** 용량(μF). 화면 표식으로 쓰고, 다 옮긴 전하 Q = C·V 를 정한다. */
  capacitance: number;
  /** 다 옮긴 뒤 판 전압(V). */
  finalVoltage: number;
  /** 몫 수. 1 이상의 정수로 읽는다. */
  chunks: number;
  /** 판 안쪽 면 사이 간격(월드 단위). */
  plateGap: number;
  /** 미는 힘 화살표 길이(월드 단위) ÷ 몫이 넘는 평균 전압(V). */
  forceArrowPerVolt: number;
}

export function readConstants(stage: StageDef): EnergyInCapacitorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    capacitance: c.capacitance ?? CAPACITANCE,
    finalVoltage: c.finalVoltage ?? FINAL_VOLTAGE,
    chunks: Math.max(1, Math.round(c.chunks ?? CHUNKS)),
    plateGap: c.plateGap ?? PLATE_GAP,
    forceArrowPerVolt: c.forceArrowPerVolt ?? FORCE_ARROW_PER_VOLT,
  };
}

/** 다 옮긴 전하(μC) — Q = C·V. 그래프 가로축 끝이 이 값이다. 화면에 수로 띄우지 않는다. */
export function finalCharge(c: EnergyInCapacitorConstants): number {
  return c.capacitance * c.finalVoltage;
}

/** 판에 q(μC)가 담겼을 때의 판 전압(V). */
export function voltageAt(q: number, c: EnergyInCapacitorConstants): number {
  return q / c.capacitance;
}

export interface ChargingReading {
  /** 위 판에 도착한 몫 수. */
  arrived: number;
  /** 지금 옮기는 몫의 번호(0 부터). 옮기는 중이 아니면 없다. */
  carrying?: number;
  /** 지금 몫이 올라간 정도 0~1(아래 판 → 위 판). */
  lift: number;
  /** 지금 몫을 미는 힘에 해당하는 평균 전압(V) — (v_k + v_{k+1}) / 2. */
  pushVoltage: number;
}

/**
 * 충전 진행을 읽는다. **단계 경계는 선언이 정한다** — `charge` 단계의 진행도에서 몫을
 * 가른다. 몫마다의 시각을 단계로 적지 못하는 것은 몫 수가 스테이지 상수라서다(장부 G13).
 */
export function readCharging(tl: TimelineFrame, c: EnergyInCapacitorConstants): ChargingReading {
  const g = tl.at('charge') * c.chunks;
  if (g >= c.chunks) return { arrived: c.chunks, lift: 0, pushVoltage: 0 };
  const k = Math.floor(g);
  const dq = finalCharge(c) / c.chunks;
  return {
    arrived: k,
    carrying: k,
    lift: g - k,
    pushVoltage: (voltageAt(k * dq, c) + voltageAt((k + 1) * dq, c)) / 2,
  };
}

/** 이번 주기에서 띠 · 표식이 남아 있는 정도 0~1. 마지막 단계에서 흐려 다시 시작한다. */
export function contentOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EnergyInCapacitorState }): EnergyInCapacitorState {
  return params.state;
}
