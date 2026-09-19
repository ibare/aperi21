// ========================================================================
// mirage — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 줄기 모양은 스테이지 상수만의 함수이고, 화면의 진행은 시간표 진행도의
// 함수다. `step` 은 항등이다.
//
// 뜨거운 공기를 층 여럿으로 나눈다. 층 i(아래에서 0 부터)의 굴절률은 찬 공기보다
// `Δn × (N − i) / N` 작다 — 길에 가까울수록 작다. 층의 경계마다 스넬을 쓴다. 층이 모두
// 수평이라 수평에서 잰 각 θ 에 대해 `n cos θ` 가 줄기 내내 같다. 더 아래 층에서 이 값이
// 1 을 넘으면 그 경계에서 되돌아 오른다(전반사) — 줄기가 휘어 오르는 자리다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import {
  DELTA_N,
  DESCENT_DEG,
  EXAGGERATION,
  EYE_X,
  EYE_Y,
  HOT_DEPTH,
  LAYERS,
  N_COOL,
  SKY_Y,
} from './schema';
import type { MirageState } from './state';

export const DEG = Math.PI / 180;

/** 배열의 i 번째 — 없으면 던진다. 빈 값으로 넘어가면 줄기가 조용히 틀린다. */
function nth<T>(arr: readonly T[], i: number): T {
  const v = arr[i];
  if (v === undefined) throw new Error(`mirage: 경로 인덱스 ${i} 가 없다`);
  return v;
}

export interface MirageConstants {
  nCool: number;
  deltaN: number;
  exaggeration: number;
  layers: number;
  hotDepth: number;
  descentDeg: number;
}

export function readConstants(stage?: StageDef): MirageConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nCool: c.nCool ?? N_COOL,
    deltaN: c.deltaN ?? DELTA_N,
    exaggeration: c.exaggeration ?? EXAGGERATION,
    layers: Math.max(1, Math.round(c.layers ?? LAYERS)),
    hotDepth: c.hotDepth ?? HOT_DEPTH,
    descentDeg: c.descentDeg ?? DESCENT_DEG,
  };
}

/** 층 i(아래에서 0 부터)의 굴절률 — 그림 속(과장된) 값. */
export function layerIndex(c: MirageConstants, i: number): number {
  return c.nCool - (c.deltaN * c.exaggeration * (c.layers - i)) / c.layers;
}

export interface MiragePath {
  /** 하늘 조각 → 눈 순서의 꺾인 점들. */
  points: Vec2[];
  /** 점마다 첫 점에서 잰 경로 길이. */
  lengths: number[];
  /** 전체 길이. */
  total: number;
  /** 하늘 쪽에서 층 윗면에 닿는 자리까지의 길이 몫(0~1). */
  entryFrac: number;
  /** 휘어 오르는 자리까지의 길이 몫(0~1). 길에 닿으면 1. */
  turnFrac: number;
  /** 하늘 조각의 가운데. */
  sky: Vec2;
  /** 눈에 들어오는 방향을 거꾸로 — 눈에서 멀어지는 쪽(단위 벡터). */
  back: Vec2;
}

/**
 * 눈에서 거꾸로 추적한다 — 빛의 길은 되돌려도 같다. 눈에서 `descentDeg` 로 내려가
 * 층을 지나고, 되돌아 올라 `SKY_Y` 에 닿는 자리가 하늘 조각이다.
 */
export function tracePath(c: MirageConstants): MiragePath {
  const a = c.descentDeg * DEG;
  const h = c.hotDepth / c.layers;
  const invariant = c.nCool * Math.cos(a);
  const back: Vec2 = [Math.cos(a), -Math.sin(a)];

  const eyeSide: Vec2[] = [[EYE_X, EYE_Y]];
  let x = EYE_X + (EYE_Y - c.hotDepth) / Math.tan(a);
  let y = c.hotDepth;
  eyeSide.push([x, y]);

  // 내려가며 지난 층의 가로 거리 — 되돌아 오를 때 같은 순서를 거꾸로 밟는다.
  const steps: number[] = [];
  let reachedRoad = true;
  for (let i = c.layers - 1; i >= 0; i--) {
    const cos = invariant / layerIndex(c, i);
    if (cos >= 1) {
      reachedRoad = false;
      break;
    }
    const dx = h / Math.tan(Math.acos(cos));
    steps.push(dx);
    x += dx;
    y -= h;
    eyeSide.push([x, y]);
  }
  const turnIndex = eyeSide.length - 1;

  const skySide: Vec2[] = [];
  if (!reachedRoad) {
    for (let k = steps.length - 1; k >= 0; k--) {
      x += nth(steps, k);
      y += h;
      skySide.push([x, y]);
    }
    x += (SKY_Y - y) / Math.tan(a);
    y = SKY_Y;
    skySide.push([x, y]);
  }

  // 하늘 → 눈 순서로 뒤집는다. 길에 닿으면(상수가 휘기에 모자라면) 줄기는 길에서 끝난다.
  const eyeFirst = [...eyeSide, ...skySide];
  const points = eyeFirst.slice().reverse();
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = nth(points, i - 1);
    const [bx, by] = nth(points, i);
    lengths.push(nth(lengths, i - 1) + Math.hypot(bx - ax, by - ay));
  }
  const total = nth(lengths, lengths.length - 1);
  const turnAt = points.length - 1 - turnIndex;
  return {
    points,
    lengths,
    total,
    entryFrac: reachedRoad ? 0 : nth(lengths, 1) / total,
    turnFrac: reachedRoad ? 1 : nth(lengths, turnAt) / total,
    sky: nth(points, 0),
    back,
  };
}

/** 경로의 앞 `frac` 몫까지의 점들과 그 끝 자리. */
export function pathUpTo(p: MiragePath, frac: number): { points: Vec2[]; head: Vec2 } {
  const s = Math.max(0, Math.min(1, frac)) * p.total;
  const out: Vec2[] = [nth(p.points, 0)];
  for (let i = 1; i < p.points.length; i++) {
    const li = nth(p.lengths, i);
    const lp = nth(p.lengths, i - 1);
    if (li <= s) {
      out.push(nth(p.points, i));
      continue;
    }
    const seg = li - lp;
    const k = seg > 0 ? (s - lp) / seg : 0;
    const [ax, ay] = nth(p.points, i - 1);
    const [bx, by] = nth(p.points, i);
    const head: Vec2 = [ax + (bx - ax) * k, ay + (by - ay) * k];
    out.push(head);
    return { points: out, head };
  }
  return { points: out, head: nth(p.points, p.points.length - 1) };
}

/**
 * 눈에서 들어온 방향을 곧게 거슬러 그은 선이 하늘 조각과 같은 가로 거리에 닿는 자리 —
 * 보이는 하늘이 놓이는 곳이다. 눈은 거리를 모르므로 가로 거리는 실제 하늘 조각에 맞춘다.
 */
export function seenAt(p: MiragePath): Vec2 {
  const dx = p.sky[0] - EYE_X;
  return [p.sky[0], EYE_Y + (p.back[1] / p.back[0]) * dx];
}

/** 쌓는 상태가 없다. */
export function step(params: { state: MirageState }): MirageState {
  return params.state;
}
