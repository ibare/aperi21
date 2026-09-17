// ========================================================================
// static-friction — 순수 물리
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { KINETIC_RATIO } from './schema';
import type { StaticFrictionState } from './state';

export interface FrictionConstants {
  /** 운동 마찰력 / 최대 정지 마찰력. */
  kineticRatio: number;
}

export function readConstants(stage: StageDef): FrictionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return { kineticRatio: c.kineticRatio ?? KINETIC_RATIO };
}

export interface FrictionReading {
  /** 당기는 힘 — 최대 정지 마찰력에 대한 비율. */
  pull: number;
  /** 마찰력 — 같은 비율. 정지 중에는 당기는 힘과 같고, 미끄러지면 운동 마찰력. */
  friction: number;
  /** 미끄러진 거리 0~1 (끝까지 간 거리에 대한 비율). */
  slid: number;
  /** 미끄러지는 중인가. */
  moving: boolean;
  /** 장면 전체의 불투명도 — 주기 첫머리에 나타나고 끝에서 흐려진다. */
  alpha: number;
}

/**
 * 시간표 한 프레임에서 두 힘과 상자 위치를 읽는다.
 *
 * - 당기는 힘은 `appear` 시작부터 `pull` 끝까지 0 → 1 로 곧게 자란다.
 *   정지 중에는 마찰력이 그만큼 맞선다.
 * - 문턱(1)에 닿으면 당기는 힘은 그 값에 머물고 마찰력은 운동 마찰력으로 줄어든다.
 * - 알짜힘이 일정하니 등가속이다 — 미끄러진 거리는 진행도의 제곱.
 */
export function readingAt(tl: TimelineFrame, c: FrictionConstants): FrictionReading {
  const moving = tl.u >= tl.start('slide');
  const pull = moving ? 1 : tl.span(tl.start('appear'), tl.end('pull'));
  const friction = moving ? c.kineticRatio : pull;
  const s = tl.at('slide');
  const alpha = tl.at('appear') * (1 - tl.at('vanish'));
  return { pull, friction, slid: s * s, moving, alpha };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StaticFrictionState }): StaticFrictionState {
  return params.state;
}
