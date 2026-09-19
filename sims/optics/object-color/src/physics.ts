// ========================================================================
// object-color — 순수 계산
// ========================================================================
// 비추는 빛 = 세 띠(파랑 · 초록 · 빨강)의 가우스 스펙트럼. 띠마다 켜진 정도는
// 시간표의 함수다 — 빛을 바꾸는 단계에서 한 조합에서 다음 조합으로 옮겨 간다.
//
// 겉면이 보이는 색 = (비추는 빛 스펙트럼 × 겉면 반사 스펙트럼)을 눈에 보이는 색으로
// 옮긴 값(`spectrumToLinearRgb`)에 흰빛 기준 노출을 곱한 것. 노출은 「흰빛을 다 되쏘는
// 겉면이 가득 찬 흰빛(가장 큰 성분 1)」 이 되게 한 번 정한다 — 빛마다 다시 맞추지 않으므로
// 파란빛만 받은 사과는 그대로 어둡다.
//
// 줄기 하나의 색 = 띠 중심 파장의 색(`wavelengthToLinearRgb`) × 켜진 정도, 되쏘여 나가는
// 줄기는 거기에 그 파장에서의 반사 몫을 곱한다. 캔버스도 테마 색도 모른다.
// ========================================================================

import { spectrumToLinearRgb, wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  APPLE_REFLECT,
  BAND_NM,
  BAND_POWER,
  BAND_WIDTH_NM,
  FLOW_SPACING,
  FLOW_SPEED,
  ILLUM_BLUE,
  ILLUM_RED,
  ILLUM_WHITE,
  LAMP_X,
  LAMP_Y,
  LEAF_REFLECT,
} from './schema';
import type { ObjectColorState } from './state';

export type Rgb = readonly [number, number, number];
/** 띠마다의 값 — 파랑, 초록, 빨강 순서. */
export type Bands = readonly [number, number, number];

export interface ObjectColorConstants {
  bandNm: Bands;
  bandWidthNm: number;
  bandPower: Bands;
  apple: { low: number; high: number; edgeNm: number; edgeWidthNm: number };
  leaf: { low: number; peak: number; peakNm: number; widthNm: number };
  illumWhite: Bands;
  illumRed: Bands;
  illumBlue: Bands;
  lamp: Vec2;
  flowSpeed: number;
  flowSpacing: number;
}

export function readConstants(stage: StageDef): ObjectColorConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    bandNm: [c.bandBlueNm ?? BAND_NM[0], c.bandGreenNm ?? BAND_NM[1], c.bandRedNm ?? BAND_NM[2]],
    bandWidthNm: c.bandWidthNm ?? BAND_WIDTH_NM,
    bandPower: [c.powerBlue ?? BAND_POWER[0], c.powerGreen ?? BAND_POWER[1], c.powerRed ?? BAND_POWER[2]],
    apple: {
      low: c.appleLow ?? APPLE_REFLECT.low,
      high: c.appleHigh ?? APPLE_REFLECT.high,
      edgeNm: c.appleEdgeNm ?? APPLE_REFLECT.edgeNm,
      edgeWidthNm: c.appleEdgeWidthNm ?? APPLE_REFLECT.edgeWidthNm,
    },
    leaf: {
      low: c.leafLow ?? LEAF_REFLECT.low,
      peak: c.leafPeak ?? LEAF_REFLECT.peak,
      peakNm: c.leafPeakNm ?? LEAF_REFLECT.peakNm,
      widthNm: c.leafWidthNm ?? LEAF_REFLECT.widthNm,
    },
    illumWhite: [c.whiteBlue ?? ILLUM_WHITE[0], c.whiteGreen ?? ILLUM_WHITE[1], c.whiteRed ?? ILLUM_WHITE[2]],
    illumRed: [c.redBlue ?? ILLUM_RED[0], c.redGreen ?? ILLUM_RED[1], c.redRed ?? ILLUM_RED[2]],
    illumBlue: [c.blueBlue ?? ILLUM_BLUE[0], c.blueGreen ?? ILLUM_BLUE[1], c.blueRed ?? ILLUM_BLUE[2]],
    lamp: [c.lampX ?? LAMP_X, c.lampY ?? LAMP_Y],
    flowSpeed: c.flowSpeed ?? FLOW_SPEED,
    flowSpacing: c.flowSpacing ?? FLOW_SPACING,
  };
}

// ------------------------------------------------------------------------
// 비추는 빛 — 시간표의 함수
// ------------------------------------------------------------------------

const lerp3 = (a: Bands, b: Bands, u: number): Bands => [
  a[0] + (b[0] - a[0]) * u,
  a[1] + (b[1] - a[1]) * u,
  a[2] + (b[2] - a[2]) * u,
];

/**
 * 띠마다 켜진 정도. 흰빛 → 빨간빛 → 파란빛 → 흰빛으로 옮겨 가는 세 단계의 진행도를 잇는다.
 * `at` 은 단계 전 0 · 뒤 1 이라 주기 처음과 끝이 모두 흰빛이다.
 */
export function bandLevels(c: ObjectColorConstants, tl: TimelineFrame): Bands {
  let v = lerp3(c.illumWhite, c.illumRed, tl.at('to-red'));
  v = lerp3(v, c.illumBlue, tl.at('to-blue'));
  return lerp3(v, c.illumWhite, tl.at('to-white'));
}

const gauss = (x: number, mu: number, s: number): number => Math.exp(-0.5 * ((x - mu) / s) ** 2);

/** 비추는 빛의 스펙트럼(파장 nm → 상대 세기). */
export function illumination(c: ObjectColorConstants, levels: Bands): (nm: number) => number {
  return (nm) =>
    levels[0] * c.bandPower[0] * gauss(nm, c.bandNm[0], c.bandWidthNm) +
    levels[1] * c.bandPower[1] * gauss(nm, c.bandNm[1], c.bandWidthNm) +
    levels[2] * c.bandPower[2] * gauss(nm, c.bandNm[2], c.bandWidthNm);
}

/** 사과 겉면 반사 스펙트럼 — 짧은 파장 `low`, 긴 파장 `high`, 그 사이 로지스틱. */
export function appleReflect(c: ObjectColorConstants): (nm: number) => number {
  const a = c.apple;
  return (nm) => a.low + (a.high - a.low) / (1 + Math.exp(-(nm - a.edgeNm) / a.edgeWidthNm));
}

/** 잎 겉면 반사 스펙트럼 — 초록 둘레만 되쏜다. */
export function leafReflect(c: ObjectColorConstants): (nm: number) => number {
  const l = c.leaf;
  return (nm) => l.low + l.peak * gauss(nm, l.peakNm, l.widthNm);
}

/** 흰빛 기준 노출 — 흰빛을 다 되쏘는 겉면의 가장 큰 성분이 1 이 되는 배율. 스테이지 상수에서 한 번 나온다. */
export function exposure(c: ObjectColorConstants): number {
  const w = spectrumToLinearRgb(illumination(c, c.illumWhite));
  return 1 / Math.max(w[0], w[1], w[2]);
}

const scale = (v: Rgb, k: number): Rgb => [v[0] * k, v[1] * k, v[2] * k];

/** 지금 빛들 — 등 · 사과 · 잎이 보이는 색과 줄기 색(들어오는 셋 · 되쏘여 나가는 셋). */
export interface Lights {
  lamp: Rgb;
  apple: Rgb;
  leaf: Rgb;
  incoming: readonly [Rgb, Rgb, Rgb];
  outgoing: readonly [Rgb, Rgb, Rgb];
  /** 띠마다 켜진 정도 · 사과에서 되쏘여 나가는 정도. 0 이면 그 줄기를 긋지 않는다. */
  levels: Bands;
  outLevels: Bands;
}

export function lightsNow(c: ObjectColorConstants, levels: Bands): Lights {
  const k = exposure(c);
  const I = illumination(c, levels);
  const ra = appleReflect(c);
  const rl = leafReflect(c);
  const hue = c.bandNm.map((nm) => wavelengthToLinearRgb(nm)) as unknown as readonly [Rgb, Rgb, Rgb];
  const outLevels: Bands = [levels[0] * ra(c.bandNm[0]), levels[1] * ra(c.bandNm[1]), levels[2] * ra(c.bandNm[2])];
  return {
    lamp: scale(spectrumToLinearRgb(I), k),
    apple: scale(spectrumToLinearRgb((nm) => I(nm) * ra(nm)), k),
    leaf: scale(spectrumToLinearRgb((nm) => I(nm) * rl(nm)), k),
    incoming: [scale(hue[0], levels[0]), scale(hue[1], levels[1]), scale(hue[2], levels[2])],
    outgoing: [scale(hue[0], outLevels[0]), scale(hue[1], outLevels[1]), scale(hue[2], outLevels[2])],
    levels,
    outLevels,
  };
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

type Bezier = readonly [Vec2, Vec2, Vec2, Vec2];

/** 3차 베지어 조각들을 SVG 경로로 — 기준점 상대 월드, y 위 (`body` custom). */
export function bezierPath(outline: readonly Bezier[], extra: readonly Vec2[] = []): string {
  const f = (p: Vec2): string => `${p[0]} ${p[1]}`;
  const first = outline[0]!;
  let d = `M ${f(first[0])}`;
  for (const [, c1, c2, p] of outline) d += ` C ${f(c1)} ${f(c2)} ${f(p)}`;
  d += ' Z';
  if (extra.length > 0) {
    d += ` M ${f(extra[0]!)}`;
    for (let i = 1; i < extra.length; i++) d += ` L ${f(extra[i]!)}`;
    d += ' Z';
  }
  return d;
}

/** 3차 베지어 조각들을 월드 점으로 표본한다 — 윤곽선. 조각마다 `perSegment` 개. */
export function bezierPoints(outline: readonly Bezier[], origin: Vec2, perSegment: number): Vec2[] {
  const out: Vec2[] = [];
  for (const [p0, p1, p2, p3] of outline) {
    for (let i = 0; i < perSegment; i++) {
      const s = i / perSegment;
      const u = 1 - s;
      const b0 = u * u * u;
      const b1 = 3 * u * u * s;
      const b2 = 3 * u * s * s;
      const b3 = s * s * s;
      out.push([
        origin[0] + b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0],
        origin[1] + b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1],
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
export function chevrons(beam: Beam, t: number, c: ObjectColorConstants, size: number, margin: number): Vec2[][] {
  const out: Vec2[][] = [];
  const [a, b] = beam;
  const shift = (((t * c.flowSpeed) % c.flowSpacing) + c.flowSpacing) % c.flowSpacing;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (len <= 0) return out;
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
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: ObjectColorState }): ObjectColorState {
  return params.state;
}
