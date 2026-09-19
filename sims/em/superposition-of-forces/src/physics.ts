// ========================================================================
// superposition-of-forces — 순수 물리
// ========================================================================
// 원천 전하 qᵢ 가 원점의 시험 전하 q 에 주는 힘 하나하나는 쿨롱 힘이고,
//
//   Fᵢ = k·q·qᵢ / rᵢ² · (원천 → 시험 전하 방향의 단위 벡터)
//
// 시험 전하가 받는 힘은 그 벡터들의 합이다. 부호가 곱에 들어가므로 같은 부호는
// 밀고(원천에서 멀어지는 쪽), 다른 부호는 당긴다(원천 쪽).
//
// 쌓는 상태가 없다. q₂ 의 자리는 `move` 단계의 진행도에서 나오고, 힘은 자리의
// 함수라 같은 시각은 언제나 같은 화면이다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARROW_SCALE,
  COULOMB_K,
  Q1_MICRO_C,
  Q1_POS,
  Q2_MICRO_C,
  Q2_MOVED_POS,
  Q2_POS,
  Q3_MICRO_C,
  Q3_POS,
  Q_TEST_MICRO_C,
} from './schema';
import type { SuperpositionOfForcesState } from './state';

/**
 * `move` 단계에서 옮겨 가는 원천의 번호(0 부터) — q₂. 캡션 문안의 `q₂` · `F₂` 와 짝이다.
 * physics 와 scene 이 모두 이 하나를 읽는다.
 */
export const MOVING_INDEX = 1;

/** μC → C. 단위 환산이다. */
const MICRO = 1e-6;

export interface SuperpositionConstants {
  k: number;
  qTestMicroC: number;
  /** 원천 셋 — 전하량(μC)과 자리(m). */
  sources: readonly { q: number; pos: Vec2 }[];
  /** `move` 단계에서 q₂ 가 옮겨 가는 자리(m). */
  q2Moved: Vec2;
  /** 힘 → 화살표 길이 배율(m/N). */
  arrowScale: number;
}

export function readConstants(stage: StageDef): SuperpositionConstants {
  const c = stage.constants ?? {};
  return {
    k: c.k ?? COULOMB_K,
    qTestMicroC: c.qTestMicroC ?? Q_TEST_MICRO_C,
    sources: [
      { q: c.q1MicroC ?? Q1_MICRO_C, pos: [c.q1X ?? Q1_POS[0], c.q1Y ?? Q1_POS[1]] },
      { q: c.q2MicroC ?? Q2_MICRO_C, pos: [c.q2X ?? Q2_POS[0], c.q2Y ?? Q2_POS[1]] },
      { q: c.q3MicroC ?? Q3_MICRO_C, pos: [c.q3X ?? Q3_POS[0], c.q3Y ?? Q3_POS[1]] },
    ],
    q2Moved: [c.q2MovedX ?? Q2_MOVED_POS[0], c.q2MovedY ?? Q2_MOVED_POS[1]],
    arrowScale: c.arrowScale ?? ARROW_SCALE,
  };
}

/** 자리 `pos` 의 원천 `q`(μC) 가 원점의 시험 전하에 주는 힘(N, 벡터). */
export function coulombForce(q: number, pos: Vec2, c: SuperpositionConstants): Vec2 {
  const dx = -pos[0];
  const dy = -pos[1];
  const d = Math.hypot(dx, dy);
  const f = (c.k * c.qTestMicroC * MICRO * q * MICRO) / (d * d);
  return [(f * dx) / d, (f * dy) / d];
}

const lerp = (a: Vec2, b: Vec2, s: number): Vec2 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
const scale = (a: Vec2, s: number): Vec2 => [a[0] * s, a[1] * s];

export interface SuperpositionReading {
  /** 원천 셋의 지금 자리(m). `MOVING_INDEX`(q₂) 만 `move` 단계에서 움직인다. */
  sources: readonly Vec2[];
  /** 힘 화살표 셋 — 지금 꼬리 자리와 화살표(m, 배율 적용). */
  arrows: readonly { from: Vec2; delta: Vec2 }[];
  /** 합력 화살표(m). 꼬리는 원점. `sum` 단계 동안 자란다. */
  net: Vec2;
  /** 옮기기 전의 합력(m) — 점선 잔상. */
  netBefore: Vec2;
}

/**
 * 지금 시각의 그림을 읽는다. **단계 경계는 선언이 정한다** — 이어 붙이기 · 합력 ·
 * 옮기기의 진행도를 모두 `timeline.at` 에게 묻는다 (S-piece 「시간표는 선언이다」).
 */
export function readScene(tl: TimelineFrame, c: SuperpositionConstants): SuperpositionReading {
  const moving = c.sources[MOVING_INDEX];
  if (c.sources.length < 1 || !moving) throw new Error('superposition-of-forces: 옮길 원천이 선언되어야 한다');

  // 옮기는 원천 하나만 `move` 단계에서 움직인다. 나머지는 제자리다.
  const movedPos = lerp(moving.pos, c.q2Moved, tl.at('move'));
  const sources: Vec2[] = c.sources.map((s, i) => (i === MOVING_INDEX ? movedPos : s.pos));
  const forces: Vec2[] = c.sources.map((s, i) => scale(coulombForce(s.q, sources[i] ?? s.pos, c), c.arrowScale));
  const forcesBefore: Vec2[] = c.sources.map((s) => scale(coulombForce(s.q, s.pos, c), c.arrowScale));

  // 이어 붙이기 — 화살표 i(두 번째부터)의 꼬리가 원점에서 앞 화살표들의 합(머리)으로
  // 미끄러진다. 옮기는 동안 방향 · 길이는 그대로다(평행 이동). 단계 id 는 `slide-{i+1}`.
  const origin: Vec2 = [0, 0];
  let head: Vec2 = origin;
  const arrows = forces.map((f, i) => {
    const from = i === 0 ? origin : lerp(origin, head, tl.at(`slide-${i + 1}`));
    head = add(head, f);
    return { from, delta: f };
  });
  const netFull = head;
  const netBefore = forcesBefore.reduce<Vec2>((acc, f) => add(acc, f), origin);

  return {
    sources,
    arrows,
    net: scale(netFull, tl.at('sum')),
    netBefore,
  };
}

/** 이번 주기에서 그림의 짙기 0~1. 떠오르고, 마지막 단계에서 흐려진다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return tl.at('appear') * (1 - tl.at('fade'));
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SuperpositionOfForcesState }): SuperpositionOfForcesState {
  return params.state;
}
