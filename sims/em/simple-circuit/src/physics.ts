// ========================================================================
// simple-circuit — 순수 물리
// ========================================================================
// 고리가 이어져 있는 `lit-*` 단계에서만 알갱이가 일정한 빠르기로 돈다. 끊긴 단계에서는
// 고리 **전체가** 멈춘다 — 끊긴 곳 근처만이 아니다. 그래서 알갱이가 흐른 거리는
// 「이어져 있던 시간의 합 × 빠르기」 이고, 닫힌 식이라 같은 시각은 언제나 같은 자리다.
// 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CARRIER_SPACING,
  CUT_A,
  CUT_B,
  CUT_C,
  FLOW_SPEED,
  LOOP_BOTTOM,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  TRAIL_SECONDS,
} from './schema';
import type { SimpleCircuitState } from './state';

export interface SimpleCircuitConstants {
  flowSpeed: number;
  carrierSpacing: number;
  trailSeconds: number;
}

export function readConstants(stage: StageDef): SimpleCircuitConstants {
  const c = stage.constants ?? {};
  return {
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    carrierSpacing: c.carrierSpacing ?? CARRIER_SPACING,
    trailSeconds: c.trailSeconds ?? TRAIL_SECONDS,
  };
}

// ------------------------------------------------------------------------
// 끊는 자리
// ------------------------------------------------------------------------

export type CutId = 'a' | 'b' | 'c';

export interface Cut {
  id: CutId;
  /** 고리 호길이 구간 [경첩, 떨어지는 끝]. */
  span: readonly [number, number];
}

/** 끊는 자리 셋 — 시간표에서 차례로 끊긴다(`cut-a` → `cut-b` → `cut-c`). */
export const CUTS: readonly Cut[] = [
  { id: 'a', span: CUT_A },
  { id: 'b', span: CUT_B },
  { id: 'c', span: CUT_C },
];

/**
 * 그 자리의 토막이 젖혀진 정도 0~1. `cut-*` 동안 0 → 1, `dark-*` 동안 1, `join-*` 동안
 * 1 → 0. 이징은 시간표 선언(`smooth`)이 건다.
 */
export function openness(tl: TimelineFrame, id: CutId): number {
  return tl.at(`cut-${id}`) - tl.at(`join-${id}`);
}

/**
 * 고리가 이어져 있는가 — 지금 단계가 흐름 단계(`lit-*`)일 때만 참이다. 토막이 떨어지는
 * 것은 `cut-*` 가 **시작하는 순간**이고, 닿는 것은 `join-*` 가 **끝나는 순간**이다.
 */
export function isClosed(tl: TimelineFrame): boolean {
  return tl.phase.startsWith('lit-');
}

/**
 * 조각 시계 0 부터 알갱이가 흐른 거리(월드)를 둘레로 접은 값.
 *
 * 한 주기에 흐르는 거리 = 빠르기 × (`lit-*` 단계 길이의 합). 지금까지는 주기 번호 × 그것 +
 * 이번 주기에 흐른 몫이다. 주기가 돌아와도 거리가 이어지므로 알갱이가 튀지 않는다.
 */
export function flowDistance(tl: TimelineFrame, speed: number, loopLength: number): number {
  let perCycle = 0;
  let thisCycle = 0;
  for (const cut of CUTS) {
    const d = tl.duration(`lit-${cut.id}`);
    perCycle += d;
    thisCycle += d * tl.at(`lit-${cut.id}`);
  }
  const wrapped = ((tl.cycle * perCycle * speed) % loopLength) + thisCycle * speed;
  return ((wrapped % loopLength) + loopLength) % loopLength;
}

// ------------------------------------------------------------------------
// 고리 — 전자가 가는 방향의 닫힌 폴리라인
// ------------------------------------------------------------------------

/**
 * 전자가 도는 길. 왼쪽 위 모서리에서 출발해 왼쪽 변을 내려가(전지 속을 + 에서 − 로
 * 지나) 아래 변을 오른쪽으로, 오른쪽 변을 위로, 위 변을 왼쪽으로(전구를 지나) 돈다.
 * 전지 밖에서는 − 극에서 나와 + 극으로 들어간다.
 */
export const LOOP_PATH: readonly Vec2[] = [
  [LOOP_LEFT, LOOP_TOP],
  [LOOP_LEFT, LOOP_BOTTOM],
  [LOOP_RIGHT, LOOP_BOTTOM],
  [LOOP_RIGHT, LOOP_TOP],
];

/** 폴리라인 위 한 자리 — 점과 그 자리의 진행 방향(단위 벡터). */
export interface PathPoint {
  pos: Vec2;
  dir: Vec2;
}

/** 닫힌 폴리라인의 누적 호길이. 마지막 값이 둘레다(끝점 → 첫 점 변 포함). */
export function cumulativeLengths(path: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 0; i < path.length; i++) {
    const a = path[i]!;
    const b = path[(i + 1) % path.length]!;
    out.push(out[i]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return out;
}

/** 닫힌 폴리라인에서 호길이 s 의 자리. */
export function pointAt(path: readonly Vec2[], lengths: readonly number[], s: number): PathPoint {
  const total = lengths[lengths.length - 1]!;
  const t = ((s % total) + total) % total;
  let i = 0;
  while (i < path.length - 1 && lengths[i + 1]! <= t) i++;
  const a = path[i]!;
  const b = path[(i + 1) % path.length]!;
  const seg = lengths[i + 1]! - lengths[i]!;
  const f = seg > 0 ? (t - lengths[i]!) / seg : 0;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return { pos: [a[0] + dx * f, a[1] + dy * f], dir: [dx / len, dy / len] };
}

/** 닫힌 폴리라인에서 호길이 구간 [a, b] 의 조각(0 ≤ a < b ≤ 둘레). 사이의 모서리를 지난다. */
export function subPath(path: readonly Vec2[], lengths: readonly number[], a: number, b: number): Vec2[] {
  const pts: Vec2[] = [pointAt(path, lengths, a).pos];
  for (let i = 1; i < lengths.length - 1; i++) {
    const s = lengths[i]!;
    if (s > a && s < b) pts.push(path[i]!);
  }
  const total = lengths[lengths.length - 1]!;
  pts.push(b >= total ? path[0]! : pointAt(path, lengths, b).pos);
  return pts;
}

/**
 * 호길이 구간 [from, to](둘레를 넘나들 수 있다)를 둘레 안의 구간들로 펴고, 빼낼 구간들
 * `holes`(둘레 안, 넘나들지 않음)를 뺀다.
 */
export function arcsWithout(
  from: number,
  to: number,
  total: number,
  holes: readonly (readonly [number, number])[],
): [number, number][] {
  const a = ((from % total) + total) % total;
  const len = to - from;
  let spans: [number, number][] = a + len <= total ? [[a, a + len]] : [[a, total], [0, a + len - total]];
  for (const [h0, h1] of holes) {
    const next: [number, number][] = [];
    for (const [s0, s1] of spans) {
      if (s1 <= h0 || s0 >= h1) {
        next.push([s0, s1]);
        continue;
      }
      if (s0 < h0) next.push([s0, h0]);
      if (s1 > h1) next.push([h1, s1]);
    }
    spans = next;
  }
  return spans.filter(([s0, s1]) => s1 - s0 > 1e-6);
}

/** 호길이 s 가 구간 [a, b] 안에 있는가. */
export function within(s: number, span: readonly [number, number]): boolean {
  return s >= span[0] && s <= span[1];
}

/**
 * 고리 위 알갱이 수. 둘레를 선언 간격에 가장 가깝게 나눠 떨어지게 한다 — 한 바퀴 돌아
 * 제자리로 올 때 간격이 한 곳만 벌어지지 않게.
 */
export function carrierCount(loopLength: number, spacing: number): number {
  return Math.max(1, Math.round(loopLength / spacing));
}

/**
 * 젖혀진 토막 위의 한 점. 경첩에서 토막 방향으로 `along` 만큼 간 자리를, 토막 방향과
 * 고리 바깥 방향 사이로 `angle` 만큼 들어 올린 곳이다.
 */
export function swung(hinge: Vec2, dir: Vec2, outward: Vec2, along: number, angle: number): Vec2 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    hinge[0] + along * (dir[0] * c + outward[0] * s),
    hinge[1] + along * (dir[1] * c + outward[1] * s),
  ];
}

/**
 * 고리 바깥을 향하는 방향. 길이 시계 반대로 돌므로(왼쪽 변은 아래로, 아래 변은 오른쪽으로)
 * 진행 방향을 시계 방향으로 90° 돌리면 바깥이다.
 */
export function outwardOf(dir: Vec2): Vec2 {
  return [dir[1], -dir[0]];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SimpleCircuitState }): SimpleCircuitState {
  return params.state;
}
