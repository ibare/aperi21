// ========================================================================
// barometer — 순수 물리
// ========================================================================
// 위가 막힌 관 속 수은 기둥 위는 진공이라 기둥을 위에서 누르는 것이 없다. 접시의 열린
// 수은 면은 바깥 공기가 누른다. 수면 높이에서 관 안과 밖의 압력이 같아야 하므로
//   p = ρ g h
// — 기둥의 세로 높이 h 가 곧 기압이다. 그래서 기압의 비는 기둥 높이의 비와 같다.
// 이 조각이 보이는 것은 식의 모양이 아니라 「공기가 덜 누르면 기둥이 내려앉는다」 이다.
//
// 선언된 것은 두 높이(76 · 57 cm)다. 화살표 길이는 그 비로 정한다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { COLUMN_HIGH, COLUMN_LOW } from './schema';
import type { BarometerState } from './state';

export interface BarometerConstants {
  /** 바닷가 기압(p₀)에서 기둥 높이(cm). */
  columnHigh: number;
  /** 낮은 기압에서 기둥 높이(cm). */
  columnLow: number;
}

export function readConstants(stage: StageDef): BarometerConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    columnHigh: c.columnHigh ?? COLUMN_HIGH,
    columnLow: c.columnLow ?? COLUMN_LOW,
  };
}

export interface ColumnReading {
  /** 수면에서 잰 기둥 윗면의 높이(cm). */
  height: number;
  /** 지금 기압 / p₀ = 지금 높이 / p₀ 의 높이. */
  pressureRatio: number;
  /** p₀ 에서 벗어나 있는가 — p₀ 화살표를 잔상으로 남길 조건이다. */
  lowered: boolean;
}

/**
 * 기둥을 읽는다. **단계 경계는 선언이 정한다** — 내려앉는 진행도를 `timeline.at('drop')`,
 * 돌아오는 진행도를 `timeline.at('rise')` 에게 묻는다. 머무는 단계에서는 진행도가 0 · 1 에
 * 머물러 높이가 저절로 그대로다.
 */
export function readColumn(tl: TimelineFrame, c: BarometerConstants): ColumnReading {
  const fall = tl.at('drop') - tl.at('rise');
  const height = c.columnHigh - (c.columnHigh - c.columnLow) * fall;
  return { height, pressureRatio: height / c.columnHigh, lowered: fall > 0 };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: BarometerState }): BarometerState {
  return params.state;
}
