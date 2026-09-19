// ========================================================================
// stefan-boltzmann-law — 순수 물리
// ========================================================================
// 판 한 장이 내보내는 복사 P = σ·A·T⁴. 막대는 첫 판(가장 찬 판)으로 나눈 비라서
// σ · A 는 지워지고 (T/T₁)⁴ 만 남는다. 온도 막대는 같은 방식으로 T/T₁ 이다.
// 쌓는 것이 없다 — 모든 것이 시간표 시각의 함수다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import {
  AREA,
  BAR_UNIT,
  EMIT_MARK_1,
  EMIT_MARK_2,
  EMIT_MARK_3,
  SIGMA,
  TEMP_1,
  TEMP_2,
  TEMP_3,
  TEMP_MARK_1,
  TEMP_MARK_2,
  TEMP_MARK_3,
} from './schema';
import type { StefanBoltzmannLawState } from './state';

export interface StefanBoltzmannLawConstants {
  /** σ (W/m²K⁴). */
  sigma: number;
  /** 판 한 장의 넓이(m²). */
  area: number;
  /** 세 판의 절대 온도(K) — 스테이지 상수 셋을 순서대로 모은 것 (G105). */
  temps: readonly number[];
  /** 막대 위 배수 글자의 정박값 — 온도 · 복사. */
  tempMarks: readonly number[];
  emitMarks: readonly number[];
  /** 표시 배율 — 배수 1 이 월드 몇 단위 높이인가. */
  barUnit: number;
}

export function readConstants(stage: StageDef): StefanBoltzmannLawConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    sigma: c.sigma ?? SIGMA,
    area: c.area ?? AREA,
    temps: [c.temp1 ?? TEMP_1, c.temp2 ?? TEMP_2, c.temp3 ?? TEMP_3],
    tempMarks: [c.tempMark1 ?? TEMP_MARK_1, c.tempMark2 ?? TEMP_MARK_2, c.tempMark3 ?? TEMP_MARK_3],
    emitMarks: [c.emitMark1 ?? EMIT_MARK_1, c.emitMark2 ?? EMIT_MARK_2, c.emitMark3 ?? EMIT_MARK_3],
    barUnit: c.barUnit ?? BAR_UNIT,
  };
}

/** 판 한 장이 내보내는 복사(W) = σ·A·T⁴. */
export function radiatedPower(c: StefanBoltzmannLawConstants, temp: number): number {
  return c.sigma * c.area * temp ** 4;
}

export interface PlateBars {
  /** 온도 막대의 다 선 높이(월드) = (T/T₁) × 배율. */
  tempHeight: number;
  /** 복사 막대의 다 선 높이(월드) = (P/P₁) × 배율. */
  emitHeight: number;
}

/** 판마다 두 막대가 다 섰을 때의 높이. 첫 판이 기준(배수 1)이다. */
export function plateBars(c: StefanBoltzmannLawConstants): PlateBars[] {
  const t0 = c.temps[0] ?? TEMP_1;
  const p0 = radiatedPower(c, t0);
  return c.temps.map((t) => ({
    tempHeight: (t / t0) * c.barUnit,
    emitHeight: (radiatedPower(c, t) / p0) * c.barUnit,
  }));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StefanBoltzmannLawState }): StefanBoltzmannLawState {
  return params.state;
}
