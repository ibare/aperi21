// ========================================================================
// maxwells-equations — 순수 물리 · 배치
// ========================================================================
// 3차원 좌표 — x 는 사슬이 번지는 쪽(화면 오른쪽), y 는 위, z 는 보는 사람 쪽.
//
// 처음 B 는 +y 로 자란다. 그 둘레의 E 고리는 xz 면에 눕고, 위에서 보아 시계 방향으로 돈다
// (바뀌는 B 와 왼손 방향). 그 E 고리의 오른쪽 끝은 +z 로 향하는 커지는 E 이고, 그것을 두른
// B 고리는 xy 면에 서서 +z 둘레를 반시계로 돈다(바뀌는 E 와 오른손 방향). 그 B 고리의
// 오른쪽 끝은 다시 +y 로 향하는 커지는 B 라, 다음 E 고리는 첫 E 고리와 같은 쪽으로 돈다.
// 사슬은 두 고리마다 같은 모양을 되풀이한다.
//
// 이웃 고리 가운데 사이가 `linkSpacing`, 고리 반길이가 `loopHalfLength` 다. 사이가 반길이의
// 두 배보다 짧으면 각 고리의 오른쪽 끝이 다음 고리의 구멍을 지난다 — 사슬 고리처럼 꿰인다.
//
// 모든 것이 시각의 함수라 상태를 쌓지 않는다. `step` 은 항등이다 (S-sim).
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  B_LOOP_HALF_HEIGHT,
  DEPTH_SKEW_X,
  DEPTH_SKEW_Y,
  E_LOOP_HALF_DEPTH,
  LINK_COUNT,
  LINK_SPACING,
  LOOP_HALF_LENGTH,
  SEED_LENGTH,
} from './schema';
import type { MaxwellsEquationsState } from './state';

export interface MaxwellsEquationsConstants {
  linkCount: number;
  linkSpacing: number;
  loopHalfLength: number;
  bLoopHalfHeight: number;
  eLoopHalfDepth: number;
  seedLength: number;
  depthSkewX: number;
  depthSkewY: number;
}

export function readConstants(stage: StageDef): MaxwellsEquationsConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    linkCount: c.linkCount ?? LINK_COUNT,
    linkSpacing: c.linkSpacing ?? LINK_SPACING,
    loopHalfLength: c.loopHalfLength ?? LOOP_HALF_LENGTH,
    bLoopHalfHeight: c.bLoopHalfHeight ?? B_LOOP_HALF_HEIGHT,
    eLoopHalfDepth: c.eLoopHalfDepth ?? E_LOOP_HALF_DEPTH,
    seedLength: c.seedLength ?? SEED_LENGTH,
    depthSkewX: c.depthSkewX ?? DEPTH_SKEW_X,
    depthSkewY: c.depthSkewY ?? DEPTH_SKEW_Y,
  };
}

/** 3차원 점 [x, y, z]. */
export type Vec3 = readonly [number, number, number];

/** 고리의 종류. 홀수 번째가 E(누운 고리), 짝수 번째가 B(선 고리)다 — 처음 원인이 B 라서. */
export type LoopKind = 'E' | 'B';

export function linkKind(index: number): LoopKind {
  return index % 2 === 1 ? 'E' : 'B';
}

/** 고리 번호(1 부터)의 가운데 x. 첫 고리가 원점이다. */
export function linkCenterX(index: number, c: MaxwellsEquationsConstants): number {
  return (index - 1) * c.linkSpacing;
}

/**
 * 처음 B 화살표의 x. 「0 번째 고리」 의 오른쪽 끝이 놓일 자리다 — 뒤 고리의 끝이 앞 고리의
 * 구멍을 지나는 자리와 같은 간격이라, 처음 B 도 첫 E 고리를 이웃 고리처럼 꿴다.
 */
export function seedX(c: MaxwellsEquationsConstants): number {
  return linkCenterX(0, c) + c.loopHalfLength;
}

/**
 * 고리를 그리기 시작하는 매개변수 — E 는 뒤쪽 끝, B 는 위쪽 끝. 다 그려지면 촉이 여기 온다.
 * E 의 앞쪽 끝은 이웃 B 고리 옆선 · 처음 B 화살표가 지나는 자리와 화면에서 붙어 있어 비켜 둔다.
 */
export function loopStart(kind: LoopKind): number {
  return kind === 'E' ? (3 * Math.PI) / 2 : Math.PI / 2;
}

/**
 * 고리 위의 점. 매개변수 t 가 늘어나는 쪽이 그 고리가 도는 쪽이다(머리 설명).
 * E: xz 면(y = 0) 에 누운 타원. B: xy 면(z = 0) 에 선 타원.
 */
export function loopPoint(kind: LoopKind, cx: number, t: number, c: MaxwellsEquationsConstants): Vec3 {
  const x = cx + c.loopHalfLength * Math.cos(t);
  if (kind === 'E') return [x, 0, c.eLoopHalfDepth * Math.sin(t)];
  return [x, c.bLoopHalfHeight * Math.sin(t), 0];
}

/** 비스듬한 투영 — 앞으로 나온 깊이만큼 화면 왼쪽 아래로 민다. */
export function project(p: Vec3, c: MaxwellsEquationsConstants): Vec2 {
  return [p[0] - p[2] * c.depthSkewX, p[1] - p[2] * c.depthSkewY];
}

/**
 * 진행도 `progress`(0~1)만큼 그려진 고리의 3차원 표본 — 시작점에서 도는 쪽으로 그 몫만큼.
 * 표본 수는 한 바퀴 기준 `segments` 에 몫을 곱한 것이다(적어도 둘).
 */
export function sweepLoop(
  kind: LoopKind,
  cx: number,
  progress: number,
  c: MaxwellsEquationsConstants,
  segments: number,
): Vec3[] {
  if (progress <= 0) return [];
  const n = Math.max(2, Math.ceil(segments * progress));
  const span = 2 * Math.PI * Math.min(1, progress);
  const out: Vec3[] = [];
  const t0 = loopStart(kind);
  for (let k = 0; k <= n; k++) out.push(loopPoint(kind, cx, t0 + (span * k) / n, c));
  return out;
}

/** 그려지는 끝(촉)의 매개변수. */
export function sweepTip(kind: LoopKind, progress: number): number {
  return loopStart(kind) + 2 * Math.PI * Math.min(1, Math.max(0, progress));
}

export function step(params: { state: MaxwellsEquationsState }): MaxwellsEquationsState {
  return params.state;
}
