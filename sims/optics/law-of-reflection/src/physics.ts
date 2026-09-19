// ========================================================================
// law-of-reflection — 순수 물리
// ========================================================================
// 입사각은 시간표의 `turn-*` 단계 진행도로 세 선언값 사이를 잇는다. 반사 광선은
// 여기서 계산하지 않는다 — scene 이 plugin-optics `traceRay` 로 거울에 쏘아 얻는다.
// 그래서 「반사각 = 입사각」 은 조각이 정해 넣은 것이 아니라 추적 결과다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { ANGLE_A, ANGLE_B, ANGLE_C } from './schema';
import type { LawOfReflectionState } from './state';

export interface LawOfReflectionConstants {
  /** 세 멈춤의 입사각(°, 법선에서 잰다). */
  angleA: number;
  angleB: number;
  angleC: number;
}

export function readConstants(stage: StageDef): LawOfReflectionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    angleA: c.angleA ?? ANGLE_A,
    angleB: c.angleB ?? ANGLE_B,
    angleC: c.angleC ?? ANGLE_C,
  };
}

/**
 * 지금 입사각(°). 단계 경계를 상수로 가르지 않는다 — 세 `turn-*` 단계의 진행도(`at`)를
 * 가중합한다. 그 단계 전에는 0, 뒤에는 1 이라 분기 없이 한 주기가 이어진다.
 */
export function incidenceDeg(tl: TimelineFrame, c: LawOfReflectionConstants): number {
  return (
    c.angleA +
    (c.angleB - c.angleA) * tl.at('turn-ab') +
    (c.angleC - c.angleB) * tl.at('turn-bc') +
    (c.angleA - c.angleC) * tl.at('turn-ca')
  );
}

/**
 * 멈춤 단계라면 그 단계가 멈춰 보이는 선언값(°), 도는 중이면 `null`.
 * 각도 글자는 이 값이 있을 때만 뜬다 — 도는 동안의 각은 계산값이라 띄우지 않는다.
 */
export function heldAngle(tl: TimelineFrame, c: LawOfReflectionConstants): number | null {
  const held: Record<string, number> = {
    'hold-a': c.angleA,
    'hold-b': c.angleB,
    'hold-c': c.angleC,
  };
  return held[tl.phase] ?? null;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LawOfReflectionState }): LawOfReflectionState {
  return params.state;
}
