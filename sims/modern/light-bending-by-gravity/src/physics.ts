// ========================================================================
// light-bending-by-gravity — 순수 물리
// ========================================================================
// 약한 중력장에서 빛이 휘는 모양. 태양 중심을 원점, 빛이 가장 가까이 지나는 거리를 b 라 하면
// 빛이 x 까지 오는 동안 꺾인 각은 전체 휜 각 α 의 (1 + x/√(x² + b²))/2 몫이다 — 태양 곁 한가운데서
// 가장 빨리 꺾이고, 멀리서는 곧다. 작은 각 근사로 이 꺾임을 적분하면 길은 닫힌 식이 된다.
//
//   y(x) = b + φ·x − (α/2)(√(x² + b²) − b)
//
// φ 는 태양 곁(x = 0)에서의 기울기다. 길이 지구(xE, 0)를 지나도록 φ 를 고른다. 들어오는 곧은 길
// (기울기 φ + α/2)과 나가는 곧은 길(φ − α/2)은 x = 0, y = b(1 + α/2) 에서 만난다 — 휜 각의 꼭짓점.
//
// 그림의 α 는 실제 각(각초)에 과장 배율을 곱한 것이다. 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { DEFLECTION_ARCSEC, EXAGGERATION } from './schema';
import type { LightBendingByGravityState } from './state';

export interface LightBendingByGravityConstants {
  /** 가장자리를 스치는 빛이 휘는 실제 각(각초). 선언값 그대로 화면에 쓴다. */
  deflectionArcsec: number;
  /** 그림에서 각을 키운 배율. 선언값 그대로 화면에 쓴다. */
  exaggeration: number;
}

export function readConstants(stage: StageDef): LightBendingByGravityConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    deflectionArcsec: c.deflectionArcsec ?? DEFLECTION_ARCSEC,
    exaggeration: c.exaggeration ?? EXAGGERATION,
  };
}

/** 1 라디안의 각초 — 180 × 3600 / π. 단위 환산의 수학 상수다. */
const ARCSEC_PER_RAD = (180 * 3600) / Math.PI;

/** 그림에서 쓰는 휜 각(라디안) = 실제 각 × 과장 배율. */
export function drawnDeflection(c: LightBendingByGravityConstants): number {
  return (c.deflectionArcsec * c.exaggeration) / ARCSEC_PER_RAD;
}

/** 빛의 길 한 벌. 배치(b · 지구 자리)와 그림의 휜 각에서 정해진다. */
export interface LightPath {
  /** 가장 가까이 지나는 거리(월드). */
  b: number;
  /** 그림의 휜 각(라디안). */
  alpha: number;
  /** 태양 곁(x = 0)에서의 기울기. */
  midSlope: number;
  /** 들어오는 곧은 길의 기울기 — 휘지 않았다면 이대로 간다. */
  inSlope: number;
  /** 휜 각의 꼭짓점 — 들어오는 곧은 길과 나가는 곧은 길이 만나는 곳. */
  vertex: Vec2;
}

/** 길이 지구(`earthX`, 0)를 지나도록 태양 곁 기울기를 고른다. */
export function lightPath(b: number, alpha: number, earthX: number): LightPath {
  const midSlope = ((alpha / 2) * (Math.hypot(earthX, b) - b) - b) / earthX;
  return {
    b,
    alpha,
    midSlope,
    inSlope: midSlope + alpha / 2,
    vertex: [0, b * (1 + alpha / 2)],
  };
}

/** 길 위 x 의 높이. */
export function pathY(p: LightPath, x: number): number {
  return p.b + p.midSlope * x - (p.alpha / 2) * (Math.hypot(x, p.b) - p.b);
}

/** 길 위 x 의 기울기 — 그 자리에서 빛이 가는 방향. */
export function pathSlope(p: LightPath, x: number): number {
  return p.midSlope - (p.alpha / 2) * (x / Math.hypot(x, p.b));
}

/** 휘지 않았다면 갔을 곧은 길(들어오는 방향 그대로)의 x 에서의 높이. */
export function unbentY(p: LightPath, x: number): number {
  return p.vertex[1] + p.inSlope * x;
}

/** 길을 [x0, x1] 에서 `count` 칸으로 나눈 점들. */
export function samplePath(p: LightPath, x0: number, x1: number, count: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= count; i++) {
    const x = x0 + ((x1 - x0) * i) / count;
    out.push([x, pathY(p, x)]);
  }
  return out;
}

/**
 * 지금 광자의 x. 다가가는 단계(`approach`)에 별에서 태양 곁까지, 휘는 단계(`bend`)에 태양 곁에서
 * 지구까지 간다. 가로로 고르게 간다 — 이 그림의 주장은 속력이 아니라 길의 모양이다.
 */
export function photonX(tl: TimelineFrame, starX: number, earthX: number): number {
  return starX + -starX * tl.at('approach') + earthX * tl.at('bend');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: LightBendingByGravityState }): LightBendingByGravityState {
  return params.state;
}
