// ========================================================================
// newtons-law-of-gravitation — 순수 물리
// ========================================================================
// 두 물체가 서로 당기는 힘의 크기는 F(d) = G·M·m / d² 하나뿐이고, M 이 받는 힘과
// m 이 받는 힘은 크기가 같고 방향이 반대다(한 쌍). 그래서 처음 거리 r 에서의 힘을
// 기준으로 두면 거리 d 에서의 힘은 **F · (r/d)²** 이다 — G · M · m 은 비에서 지워진다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { FAR_MULTIPLE_1, FAR_MULTIPLE_2, NEAR_DISTANCE } from './schema';
import type { NewtonsLawOfGravitationState } from './state';

export interface GravitationConstants {
  /** 처음 거리 r(월드 단위). */
  nearDistance: number;
  /** 첫째 · 둘째로 벌리는 거리 배수. */
  farMultiple1: number;
  farMultiple2: number;
}

export function readConstants(stage: StageDef): GravitationConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nearDistance: c.nearDistance ?? NEAR_DISTANCE,
    farMultiple1: c.farMultiple1 ?? FAR_MULTIPLE_1,
    farMultiple2: c.farMultiple2 ?? FAR_MULTIPLE_2,
  };
}

/**
 * 지금 두 중심 사이의 거리가 r 의 몇 배인가.
 *
 * **단계 경계는 선언이 정한다.** 벌리는 단계 · 되돌아오는 단계의 진행도(`at`, 이징 적용)를
 * 더해 배수를 얻는다 — 단계 전에는 0, 동안 0~1, 뒤에는 1 이라 분기가 필요 없다.
 *   1 → farMultiple1 (stretch1) → farMultiple2 (stretch2) → 1 (return)
 */
export function distanceMultiple(tl: TimelineFrame, c: GravitationConstants): number {
  return (
    1 +
    (c.farMultiple1 - 1) * tl.at('stretch1') +
    (c.farMultiple2 - c.farMultiple1) * tl.at('stretch2') -
    (c.farMultiple2 - 1) * tl.at('return')
  );
}

/** 처음 거리의 힘을 1 로 둔 힘의 크기. 역제곱이다 — 두 물체가 같은 값을 받는다. */
export function relativeForce(multiple: number): number {
  return 1 / (multiple * multiple);
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: NewtonsLawOfGravitationState }): NewtonsLawOfGravitationState {
  return params.state;
}
