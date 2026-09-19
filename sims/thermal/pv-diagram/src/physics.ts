// ========================================================================
// pv-diagram — 순수 물리
// ========================================================================
// DOM · 캔버스 · 실시간을 모른다. 시간표도 모른다 — scene 이 단계 진행도를 읽어
// 다리(leg) 목록으로 넘기면, 여기서 그 다리들을 차례로 이어 지금 상태와 지나온 길을 낸다.
// 모든 것이 (단계 진행도, 선언값)의 함수라 쌓는 것이 없다.
// ========================================================================

import type { StageDef } from '@aperi21/schema';
import type { PvDiagramState } from './state';

export interface PvDiagramConstants {
  /** 상태 A 의 추 개수 — A 의 압력(추 하나 = P 한 칸). */
  blocksA: number;
  /** 상태 B 의 추 개수 — B 의 압력. */
  blocksB: number;
  /** 상태 A 의 부피(L). */
  v1: number;
  /** 상태 B 의 부피(L). */
  v2: number;
}

export function readConstants(stage: StageDef): PvDiagramConstants {
  const c = stage.constants ?? {};
  return {
    blocksA: c.blocksA ?? 3,
    blocksB: c.blocksB ?? 1,
    v1: c.v1 ?? 1,
    v2: c.v2 ?? 3,
  };
}

/** 내릴 추의 수 — 시간표의 `*-drop*` 단계 수와 같다. */
export function dropCount(c: PvDiagramConstants): number {
  return Math.max(0, c.blocksA - c.blocksB);
}

/**
 * 길의 다리 하나. `expand` 는 압력을 그대로 두고 부피를 v1 → v2 로, `drop` 은 부피를
 * 그대로 두고 추 하나만큼 압력을 낮춘다. `progress` 는 그 단계의 진행도(0~1).
 * 목록은 **단계가 시작하는 순서** 로 온다.
 */
export interface Leg {
  kind: 'expand' | 'drop';
  progress: number;
}

/** 지나온 길과 지금 상태. 좌표는 (부피 L, 압력 추 개수). */
export interface PathNow {
  /** 지나온 길 — A 에서 지금 자리까지 꺾은선. */
  points: readonly (readonly [number, number])[];
  /** 지금 부피 · 압력. */
  v: number;
  p: number;
  /** 부피를 늘린 다리의 압력 — 칠해지는 넓이의 높이. 늘리기 전이면 지금 압력. */
  pExpand: number;
  /** 지금까지 늘린 부피의 오른쪽 끝(L). 칠해지는 넓이의 오른쪽 변. */
  vFilled: number;
  /** 시작한 `drop` 다리마다 — 그때의 부피(추를 내려놓는 선반의 높이)와 진행도. 차례대로. */
  drops: readonly { v: number; progress: number }[];
}

/**
 * 다리를 차례로 잇는다. 아직 시작하지 않은 다리에서 멈춘다 — 그 뒤 다리는 보지 않는다.
 * 넓이는 부피가 늘어나는 다리 아래에만 생긴다(부피가 그대로면 가로 폭이 0 이다).
 */
export function walkPath(legs: readonly Leg[], c: PvDiagramConstants): PathNow {
  let v = c.v1;
  let p = c.blocksA;
  let pExpand = p;
  let vFilled = c.v1;
  const drops: { v: number; progress: number }[] = [];
  const points: [number, number][] = [[v, p]];
  for (const leg of legs) {
    if (leg.progress <= 0) break;
    if (leg.kind === 'expand') {
      pExpand = p;
      v = c.v1 + (c.v2 - c.v1) * leg.progress;
      vFilled = v;
    } else {
      p = p - leg.progress;
      drops.push({ v, progress: leg.progress });
    }
    points.push([v, p]);
    if (leg.progress < 1) break;
  }
  if (legs.every((l) => l.kind !== 'expand' || l.progress <= 0)) pExpand = p;
  return { points, v, p, pExpand, vFilled, drops };
}

/** 캡션 `vars` 가 가리킬 선언값의 글자. 계산해 줄이지 않는다. */
export function deriveTexts(c: PvDiagramConstants): PvDiagramState {
  return {
    nAText: String(c.blocksA),
    nBText: String(c.blocksB),
  };
}

/** 쌓는 것이 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: PvDiagramState }): PvDiagramState {
  return params.state;
}
