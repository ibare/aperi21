// ========================================================================
// seeing-requires-light — 순수 계산
// ========================================================================
// 등 세기는 시간표의 함수다 — 끄는 단계에서 내려가고 켜는 단계에서 올라온다.
// 사과 겉면의 밝기 = 등 빛 × 사과 반사율 × 등 세기, 튄 줄기 하나 = 그것 × 튀는 몫.
// 등 세기가 0 이면 셋이 함께 0 이 된다. 줄기의 자리와 꺾쇠의 흐름은 배치 계산이다.
// 캔버스도 테마 색도 모른다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APPLE_ALBEDO,
  APPLE_OUTLINE,
  FLOW_SPACING,
  FLOW_SPEED,
  LAMP_INTENSITY,
  LAMP_RGB,
  LAMP_X,
  LAMP_Y,
  SCATTER_SHARE,
} from './schema';
import type { SeeingRequiresLightState } from './state';

export type Rgb = readonly [number, number, number];

export interface SeeingRequiresLightConstants {
  /** 켜진 등의 세기(0~1). */
  lampIntensity: number;
  /** 전구 중심 자리(월드). */
  lamp: Vec2;
  /** 등 빛의 색(선형광). */
  lampRgb: Rgb;
  /** 사과 반사율(성분마다). */
  albedo: Rgb;
  /** 튄 줄기 하나의 몫. */
  scatterShare: number;
  /** 꺾쇠 흐름 속력(월드/초) · 간격(월드). */
  flowSpeed: number;
  flowSpacing: number;
}

export function readConstants(stage: StageDef): SeeingRequiresLightConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    lampIntensity: c.lampIntensity ?? LAMP_INTENSITY,
    lamp: [c.lampX ?? LAMP_X, c.lampY ?? LAMP_Y],
    lampRgb: [c.lampR ?? LAMP_RGB[0], c.lampG ?? LAMP_RGB[1], c.lampB ?? LAMP_RGB[2]],
    albedo: [c.albedoR ?? APPLE_ALBEDO[0], c.albedoG ?? APPLE_ALBEDO[1], c.albedoB ?? APPLE_ALBEDO[2]],
    scatterShare: c.scatterShare ?? SCATTER_SHARE,
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    flowSpacing: c.flowSpacing ?? FLOW_SPACING,
  };
}

/**
 * 켜진 정도 0~1. 끄는 단계에서 1 → 0, 켜는 단계에서 0 → 1. 두 단계의 이징은 선언이 정한다.
 * 단계 전 `at` 은 0, 뒤는 1 이라 주기 처음(켜짐)과 끝(다시 켜짐) 모두 1 이다.
 */
export function switchedOn(tl: TimelineFrame): number {
  return 1 - tl.at('switch-off') + tl.at('switch-on');
}

const scale = (v: Rgb, k: number): Rgb => [v[0] * k, v[1] * k, v[2] * k];
const mul = (a: Rgb, b: Rgb): Rgb => [a[0] * b[0], a[1] * b[1], a[2] * b[2]];

/** 지금 빛들 — 등이 내는 빛, 사과 겉면이 튀기는 빛, 튄 줄기 하나(= 눈에 닿는 빛). */
export interface Lights {
  lamp: Rgb;
  appleSurface: Rgb;
  scattered: Rgb;
}

export function lightsNow(c: SeeingRequiresLightConstants, on: number): Lights {
  const lamp = scale(c.lampRgb, c.lampIntensity * on);
  const appleSurface = mul(lamp, c.albedo);
  return { lamp, appleSurface, scattered: scale(appleSurface, c.scatterShare) };
}

// ------------------------------------------------------------------------
// 기하
// ------------------------------------------------------------------------

export const polar = (c: Vec2, r: number, a: number): Vec2 => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
export const angleOf = (from: Vec2, to: Vec2): number => Math.atan2(to[1] - from[1], to[0] - from[0]);

/** 원을 표본한 닫힌 점 목록. */
export function circlePoints(c: Vec2, r: number, n: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < n; i++) out.push(polar(c, r, (i / n) * Math.PI * 2));
  return out;
}

/** 사과 윤곽을 SVG 경로로 — 중심 기준 월드, y 위 (`body` custom). 꼭지는 따로 덧붙인다. */
export function appleOutlinePath(stem: readonly Vec2[]): string {
  const f = (p: Vec2): string => `${p[0]} ${p[1]}`;
  const first = APPLE_OUTLINE[0]!;
  let d = `M ${f(first[0])}`;
  for (const [, c1, c2, p] of APPLE_OUTLINE) d += ` C ${f(c1)} ${f(c2)} ${f(p)}`;
  d += ' Z';
  if (stem.length > 0) {
    d += ` M ${f(stem[0]!)}`;
    for (let i = 1; i < stem.length; i++) d += ` L ${f(stem[i]!)}`;
    d += ' Z';
  }
  return d;
}

/** 사과 윤곽을 월드 점으로 표본한다 — 어둠 속 점선 윤곽. 조각마다 `perSegment` 개. */
export function appleOutlinePoints(center: Vec2, perSegment: number): Vec2[] {
  const out: Vec2[] = [];
  for (const [p0, p1, p2, p3] of APPLE_OUTLINE) {
    for (let i = 0; i < perSegment; i++) {
      const s = i / perSegment;
      const u = 1 - s;
      const b0 = u * u * u;
      const b1 = 3 * u * u * s;
      const b2 = 3 * u * s * s;
      const b3 = s * s * s;
      out.push([
        center[0] + b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
        center[1] + b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1],
      ]);
    }
  }
  return out;
}

/** 줄기 하나 — 시작 · 끝 (빛이 가는 방향으로). */
export type Beam = readonly [Vec2, Vec2];

/**
 * 줄기 위를 흐르는 꺾쇠 `>` 들. 꼭짓점이 빛이 가는 쪽을 가리킨다.
 *
 * 자리는 조각 시계의 함수다 — (시각 × 흐름 속력)을 간격으로 나눈 나머지만큼 밀려 있다.
 * 같은 시각은 언제나 같은 자리다. 줄기 끝에서 `margin` 안쪽까지만 둔다.
 */
export function chevrons(
  beams: readonly Beam[],
  t: number,
  c: SeeingRequiresLightConstants,
  size: number,
  margin: number,
): Vec2[][] {
  const out: Vec2[][] = [];
  const shift = ((t * c.flowSpeed) % c.flowSpacing + c.flowSpacing) % c.flowSpacing;
  for (const [a, b] of beams) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len <= 0) continue;
    const d: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const n: Vec2 = [-d[1], d[0]];
    for (let s = shift; s <= len - margin; s += c.flowSpacing) {
      if (s < margin + size) continue;
      const tip: Vec2 = [a[0] + d[0] * s, a[1] + d[1] * s];
      const back: Vec2 = [tip[0] - d[0] * size, tip[1] - d[1] * size];
      out.push([
        [back[0] + n[0] * size, back[1] + n[1] * size],
        tip,
        [back[0] - n[0] * size, back[1] - n[1] * size],
      ]);
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: SeeingRequiresLightState }): SeeingRequiresLightState {
  return params.state;
}
