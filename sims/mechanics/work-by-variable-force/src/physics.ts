// ========================================================================
// work-by-variable-force — 순수 물리
// ========================================================================
// 미는 힘이 자리의 함수다: F(x) = 바닥 + 봉우리 × sin(πx/L).
// 상자는 한 빠르기로 0 → L 을 간다. 지금까지 한 일은 0 에서 지금 자리까지 곡선
// 아래 넓이 ∫F dx 이고, 같은 빠르기라면 넓이가 쌓이는 빠르기가 곧 그 자리의 힘이다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { FORCE_BASE, FORCE_PEAK, PUSH_LENGTH, STRIP_WIDTH } from './schema';
import type { WorkByVariableForceState } from './state';

export interface WorkByVariableForceConstants {
  /** 밀려 가는 거리 L(월드 m). */
  length: number;
  /** 힘의 바닥값 · 봉우리 높이(그래프 높이 = 화살표 길이, 월드 m). */
  forceBase: number;
  forcePeak: number;
  /** 띠 폭 Δx(월드 m). */
  strip: number;
}

export function readConstants(stage: StageDef): WorkByVariableForceConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    length: c.length ?? PUSH_LENGTH,
    forceBase: c.forceBase ?? FORCE_BASE,
    forcePeak: c.forcePeak ?? FORCE_PEAK,
    strip: c.strip ?? STRIP_WIDTH,
  };
}

/** 자리 x 에서 미는 힘. */
export function forceAt(x: number, c: WorkByVariableForceConstants): number {
  const s = Math.min(Math.max(x / c.length, 0), 1);
  return c.forceBase + c.forcePeak * Math.sin(Math.PI * s);
}

/**
 * 지금 상자 자리. **단계 경계는 선언이 정한다** — 두 밀기 단계의 진행도(`at`)를 반씩
 * 더한다. 둘 다 `linear` 에 같은 길이라 상자는 한 빠르기로 간다. 저작자가 한쪽을 늘이면
 * 그쪽 절반이 느려질 뿐 끝자리는 그대로다.
 */
export function pushedTo(tl: TimelineFrame, c: WorkByVariableForceConstants): number {
  return (c.length / 2) * (tl.at('push-rise') + tl.at('push-fall'));
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 넓이를 지우고 다시 민다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 넓이는 지금 자리까지의 곡선 아래라 시각의 함수다. */
export function step(params: { state: WorkByVariableForceState }): WorkByVariableForceState {
  return params.state;
}
