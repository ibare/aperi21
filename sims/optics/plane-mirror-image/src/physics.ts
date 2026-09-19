// ========================================================================
// plane-mirror-image — 순수 물리
// ========================================================================
// 물체 거리는 시간표의 `away` · `toward` 단계 진행도로 두 선언값 사이를 잇는다.
// 반사 줄기는 여기서 정하지 않는다 — scene 이 plugin-optics `traceRay` 로 거울에 쏘아 얻고,
// 상의 자리는 그 반사 줄기 둘을 거꾸로 이은 직선의 교점(`meetBehind`)이다. 그래서
// 「거울 뒤 같은 거리」 는 조각이 정해 넣은 것이 아니라 추적 결과다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { FAR_CM, NEAR_CM, WORLD_PER_CM } from './schema';
import type { PlaneMirrorImageState } from './state';

export interface PlaneMirrorImageConstants {
  /** 가까운 멈춤 · 먼 멈춤에서 물체와 거울 사이 거리(cm). */
  nearCm: number;
  farCm: number;
  /** 표시 배율 — cm 하나가 월드 몇 단위인가. */
  worldPerCm: number;
}

export function readConstants(stage: StageDef): PlaneMirrorImageConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nearCm: c.nearCm ?? NEAR_CM,
    farCm: c.farCm ?? FAR_CM,
    worldPerCm: c.worldPerCm ?? WORLD_PER_CM,
  };
}

/**
 * 지금 물체와 거울 사이 거리(cm). 단계 경계를 상수로 가르지 않는다 — `away` · `toward`
 * 진행도(`at`)를 가중합한다. 그 단계 전에는 0, 뒤에는 1 이라 분기 없이 한 주기가 이어진다.
 */
export function objectCm(tl: TimelineFrame, c: PlaneMirrorImageConstants): number {
  return c.nearCm + (c.farCm - c.nearCm) * tl.at('away') + (c.nearCm - c.farCm) * tl.at('toward');
}

/**
 * 멈춤 단계라면 그 단계가 멈춰 보이는 선언값(cm), 움직이는 중이면 `null`.
 * 치수선 글자는 이 값이 있을 때만 뜬다 — 움직이는 동안의 거리는 계산값이라 띄우지 않는다.
 */
export function heldCm(tl: TimelineFrame, c: PlaneMirrorImageConstants): number | null {
  const held: Record<string, number> = { near: c.nearCm, far: c.farCm, behind: c.farCm };
  return held[tl.phase] ?? null;
}

/**
 * 두 직선의 교점 — 점 `p` 에서 방향 `u`, 점 `q` 에서 방향 `v`. 나란하면 `null`.
 * 반사 줄기 둘을 거울 뒤로 거꾸로 이은 선이 만나는 점(상)을 구한다.
 */
export function meetBehind(p: Vec2, u: Vec2, q: Vec2, v: Vec2): Vec2 | null {
  const det = u[0] * v[1] - u[1] * v[0];
  if (Math.abs(det) < 1e-12) return null;
  const s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / det;
  return [p[0] + u[0] * s, p[1] + u[1] * s];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PlaneMirrorImageState }): PlaneMirrorImageState {
  return params.state;
}
