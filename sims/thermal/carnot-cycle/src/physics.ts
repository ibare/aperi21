// ========================================================================
// carnot-cycle — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import { TC_RANGE, TC_STEP } from './schema';
import type { CarnotCycleState } from './state';

export interface EngineConstants {
  /** 뜨거운 쪽 온도(K). */
  th: number;
  /** 도표 위 끝 온도(K). */
  tTop: number;
  /** 차가운 쪽 기본 온도(K). */
  tcDefault: number;
  /** 한 줄기 열이 바닥 아래로 빠져나가는 시간(초). */
  sinkSeconds: number;
}

export function readConstants(stage: StageDef): EngineConstants {
  const c = stage.constants ?? {};
  return {
    th: c.th ?? 500,
    tTop: c.tTop ?? 560,
    tcDefault: c.tcDefault ?? 300,
    sinkSeconds: c.sinkSeconds ?? 0.9,
  };
}

/** 조작값을 범위 · 5 K 눈금에 붙인다. */
export function clampTc(tc: number): number {
  const snapped = TC_RANGE[0] + Math.round((tc - TC_RANGE[0]) / TC_STEP) * TC_STEP;
  return Math.min(TC_RANGE[1], Math.max(TC_RANGE[0], snapped));
}

/**
 * 버린 열 / 받은 열 = T차 / T뜨 (백분율). 같은 엔트로피 폭 위의 두 면적이라 높이의 비다.
 * 50~450 K · 5 K 단위 · 500 K 라 언제나 정수다 — 반올림은 안전선일 뿐이다.
 */
export function discardPercent(tc: number, th: number): number {
  return Math.round((tc / th) * 100);
}

export function deriveTexts(
  tc: number,
  c: EngineConstants,
): Pick<CarnotCycleState, 'thText' | 'tcText' | 'discardText' | 'workText'> {
  const discard = discardPercent(tc, c.th);
  return {
    thText: String(c.th),
    tcText: String(tc),
    discardText: String(discard),
    workText: String(100 - discard),
  };
}

/** 쌓는 것이 없다 — 조작값에서 캡션 값만 다시 만든다. */
export function step(params: { state: CarnotCycleState; dt: number; stage: StageDef }): CarnotCycleState {
  const { state, stage } = params;
  const c = readConstants(stage);
  const tc = clampTc(state.tc);
  return { ...state, tc, ...deriveTexts(tc, c) };
}
