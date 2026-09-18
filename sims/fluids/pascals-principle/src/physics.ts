// ========================================================================
// pascals-principle — 순수 물리
// ========================================================================
// 닫힌 물에 가한 압력은 어디에나 같게 전해진다(파스칼 원리). 작은 피스톤(폭 w)을
// 힘 F 로 누르면 물의 압력은 p = F / w 이고, 큰 피스톤(폭 N·w)은 같은 p 로 떠받쳐
//   F_큰 = p · N·w = N · F
// 를 받는다. 물은 줄지 않으므로 작은 쪽이 d 내려가면 큰 쪽은
//   w · d = N·w · x  →  x = d / N
// 만 오른다. 그림은 옆에서 본 단면이라 넓이를 폭으로 잰다(깊이 방향은 둘이 같다).
//
// 두 피스톤 높이 차이가 만드는 정수압(ρ g Δh)은 더하지 않는다 — 손의 힘이 그것보다
// 훨씬 크다고 본다. 넣으면 이웃 `hydrostatic-pressure` 의 주장이 끼어든다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { RATIO, SMALL_WIDTH, STROKE } from './schema';
import type { PascalsPrincipleState } from './state';

export interface PascalsPrincipleConstants {
  /** 넓이 비 N. */
  ratio: number;
  /** 작은 피스톤이 내려가는 거리 d(m). */
  stroke: number;
  /** 작은 피스톤의 폭 w(m). */
  smallWidth: number;
}

export function readConstants(stage: StageDef): PascalsPrincipleConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    ratio: c.ratio ?? RATIO,
    stroke: c.stroke ?? STROKE,
    smallWidth: c.smallWidth ?? SMALL_WIDTH,
  };
}

export interface PressPose {
  /** 작은 피스톤 밑면의 높이(m, 처음 자리 0 에서 아래가 음수). */
  smallY: number;
  /** 큰 피스톤 밑면의 높이(m, 위가 양수). */
  largeY: number;
  /**
   * 손의 힘과 압력이 선 정도 0~1. 누름 단계에서 자라고 돌아감 단계에서 줄어든다.
   * 화살표 길이가 아니라 **짙기**에 건다 — 길이는 압력의 크기라 자라는 동안에도 같아야 한다.
   */
  pressure: number;
}

/**
 * 두 피스톤의 자리와 압력이 선 정도. **단계 경계는 선언이 정한다** — 누름 · 행정 ·
 * 돌아감의 진행도를 `timeline.at` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 * 멈춤 · 쉼 단계에서는 진행도가 0 이나 1 에 머물러 자리가 저절로 그대로다.
 */
export function readPose(tl: TimelineFrame, c: PascalsPrincipleConstants): PressPose {
  const back = 1 - tl.at('release');
  const s = tl.at('stroke') * back;
  return {
    smallY: -c.stroke * s,
    largeY: (c.stroke / c.ratio) * s,
    pressure: tl.at('press') * back,
  };
}

/** 큰 피스톤의 폭 N·w. 폭 w 마다 압력 화살표 하나가 선다. */
export function largeWidth(c: PascalsPrincipleConstants): number {
  return c.ratio * c.smallWidth;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. 캡션 글자는 그대로 둔다. */
export function step(params: { state: PascalsPrincipleState }): PascalsPrincipleState {
  return params.state;
}
