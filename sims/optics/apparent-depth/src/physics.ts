// ========================================================================
// apparent-depth — 순수 물리
// ========================================================================
// 쌓는 상태가 없다. 모든 값이 시간표 진행도의 함수이고 `step` 은 항등이다.
//
// 동전(0, −깊이)에서 법선 양쪽으로 같은 각 θ 로 나온 두 줄기가 수면(±x, 0)에 닿는다.
// 공기 쪽 각 φ 는 n sinθ = sinφ 에서 나오고(법선 밖으로 꺾인다), 공기 쪽 줄기를 곧게 거꾸로
// 이으면 법선 x = 0 위, 깊이 x / tanφ 에서 만난다 — 겉보기 깊이다. 거의 수직일 때
// 깊이 ÷ n 에 가깝다(θ 10° 에서 물 8.91 cm · 유리 7.84 cm).
//
// 교점 · 보이는 동전의 자리는 이 계산 하나로 정한다. 화면 글자는 정박값 상수다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  DEPTH_CM,
  EYE_HEIGHT_CM,
  GLASS_APPARENT_CM,
  N_AIR,
  N_GLASS,
  N_WATER,
  RAY_DEG,
  WATER_APPARENT_CM,
} from './schema';
import type { ApparentDepthState } from './state';

export const DEG = Math.PI / 180;

export interface ApparentDepthConstants {
  nAir: number;
  nWater: number;
  nGlass: number;
  depthCm: number;
  waterApparentCm: number;
  glassApparentCm: number;
  rayDeg: number;
  eyeHeightCm: number;
}

export function readConstants(stage?: StageDef): ApparentDepthConstants {
  const c = (stage?.constants ?? {}) as Record<string, number | undefined>;
  return {
    nAir: c.nAir ?? N_AIR,
    nWater: c.nWater ?? N_WATER,
    nGlass: c.nGlass ?? N_GLASS,
    depthCm: c.depthCm ?? DEPTH_CM,
    waterApparentCm: c.waterApparentCm ?? WATER_APPARENT_CM,
    glassApparentCm: c.glassApparentCm ?? GLASS_APPARENT_CM,
    rayDeg: c.rayDeg ?? RAY_DEG,
    eyeHeightCm: c.eyeHeightCm ?? EYE_HEIGHT_CM,
  };
}

/** 한 매질(굴절률 n)에서 본 기하. 두 줄기는 x = 0 을 사이에 두고 대칭이라 오른쪽 하나만 적는다. */
export interface Optics {
  /** 굴절점의 x (수면 위, 오른쪽). */
  hitX: number;
  /** 공기 쪽 각(라디안, 법선에서). */
  airAngle: number;
  /** 공기 쪽 줄기가 눈 높이에 닿는 x. */
  eyeX: number;
  /** 거꾸로 이은 두 점선이 만나는 깊이(양수, cm). */
  apparentDepth: number;
}

/** 스넬 — 아래 매질(n)에서 공기(n₀)로 나갈 때의 각. 임계각보다 작은 각만 쓴다. */
export function airAngleOf(n: number, nAir: number, inside: number): number {
  const s = (n / nAir) * Math.sin(inside);
  return Math.asin(Math.max(-1, Math.min(1, s)));
}

export function opticsFor(n: number, c: ApparentDepthConstants): Optics {
  const inside = c.rayDeg * DEG;
  const hitX = c.depthCm * Math.tan(inside);
  const airAngle = airAngleOf(n, c.nAir, inside);
  return {
    hitX,
    airAngle,
    eyeX: hitX + c.eyeHeightCm * Math.tan(airAngle),
    apparentDepth: hitX / Math.tan(airAngle),
  };
}

export interface Reading {
  /** 지금 아래 매질의 굴절률(물 ↔ 유리 사이를 잇는다). */
  n: number;
  /** 지금 기하. */
  now: Optics;
  /** 물일 때의 기하 — 유리 단계에서 옅게 남기는 자리. */
  water: Optics;
  /** 거꾸로 잇는 점선이 자란 몫 0~1. */
  extend: number;
  /** 점선 · 교점 표시의 짙기 0~1 (reset 에 옅어진다). */
  traceAlpha: number;
  /** 보이는 동전 · 겉보기 깊이 치수의 짙기 0~1. */
  imageAlpha: number;
  /** 물에서 보이던 자리를 옅게 남기는 몫 0~1 (유리로 바뀌는 동안 자란다). */
  waterMemory: number;
  /** 매질 이름 줄의 무게 — 물 · 유리. 합이 1. */
  weight: { water: number; glass: number };
  /** 겉보기 깊이 글자를 띄울 단계인가 — 물에 머묾 · 유리에 머묾. 옮겨 가는 동안에는 띄우지 않는다. */
  settled: 'water' | 'glass' | null;
}

/**
 * 시간표 진행도 → 화면에 놓을 값. 같은 시각은 언제나 같은 값이다.
 *
 * 단계 경계를 상수로 두고 가르지 않는다 — `at(id)` 는 그 단계 앞에서 0, 지난 뒤 1 이다.
 */
export function derive(tl: TimelineFrame, c: ApparentDepthConstants): Reading {
  const extend = tl.at('extend');
  const appear = tl.at('appear');
  const toGlass = tl.at('toGlass');
  const reset = tl.at('reset');

  const glassWeight = toGlass - reset;
  const n = c.nWater + (c.nGlass - c.nWater) * glassWeight;
  const fade = 1 - reset;

  return {
    n,
    now: opticsFor(n, c),
    water: opticsFor(c.nWater, c),
    extend,
    traceAlpha: fade,
    imageAlpha: appear * fade,
    waterMemory: toGlass * fade,
    weight: { water: 1 - glassWeight, glass: glassWeight },
    settled:
      tl.phase === 'appear' || tl.phase === 'waterHold'
        ? 'water'
        : tl.phase === 'glassHold'
          ? 'glass'
          : null,
  };
}

/** 쌓는 상태가 없다. */
export function step(params: { state: ApparentDepthState }): ApparentDepthState {
  return params.state;
}
