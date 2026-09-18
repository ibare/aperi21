// ========================================================================
// wavefront-and-ray — 순수 물리 · 배치 계산
// ========================================================================
// 점파원 S 에서 나온 물결의 위상: φ(p) = k(|p − S| − D) − ωt.
//   D 는 파원에서 기준점까지 거리. 위상을 D 에 맞춰 두어, 판이 파원에서 멀어져도 기준점의
//   물결은 늘 같은 위상으로 흐른다 — 파면이 판 위를 거꾸로 휩쓸지 않는다.
// 파면(마루)은 φ = 2πn 인 자리 — S 를 중심으로 한 원, 반지름 D + s + nλ (s = ct mod λ).
// 광선은 S 에서 나와 기준 세로줄의 정해진 높이를 지나는 반직선 — 늘 원의 반지름 방향이다.
//
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ARC_SAMPLES,
  CELL,
  FAR_DISTANCE,
  FIELD_H,
  FIELD_W,
  NEAR_DISTANCE,
  RAY_OFFSETS,
  REF_X,
  REF_Y,
  WAVELENGTH,
  WAVE_SPEED,
} from './schema';
import type { WavefrontAndRayState } from './state';

/** 물결 장 격자 가로 · 세로 칸 수. */
export const COLS = Math.ceil(FIELD_W / CELL);
export const ROWS = Math.ceil(FIELD_H / CELL);

export interface WavefrontAndRayConstants {
  /** 파장(월드). */
  wavelength: number;
  /** 파의 속력(월드/초). */
  waveSpeed: number;
  /** 가장 가까울 때 파원 거리(월드). */
  nearDistance: number;
  /** 가장 멀 때 파원 거리(월드). */
  farDistance: number;
}

export function readConstants(stage: StageDef): WavefrontAndRayConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wavelength: c.wavelength ?? WAVELENGTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    nearDistance: c.nearDistance ?? NEAR_DISTANCE,
    farDistance: c.farDistance ?? FAR_DISTANCE,
  };
}

/**
 * 파원 거리 D — 멀어지는 정도 g(0 ~ 1)를 **로그로** 잇는다. 곧게 이으면 앞의 한순간에
 * 파면이 펴져 버려 「점점 펴진다」 가 보이지 않는다.
 * g 는 선언이 정한다 — `recede` 동안 0 → 1, `return` 동안 1 → 0.
 */
export function sourceDistance(tl: TimelineFrame, c: WavefrontAndRayConstants): number {
  const g = tl.at('recede') * (1 - tl.at('return'));
  return c.nearDistance * Math.pow(c.farDistance / c.nearDistance, g);
}

/** 파원 자리(월드). 기준점에서 왼쪽으로 D. */
export function sourcePos(d: number): Vec2 {
  return [REF_X - d, REF_Y];
}

/** 파원이 판 안에 있는가. */
export function insideField(p: Vec2): boolean {
  return p[0] >= 0 && p[0] <= FIELD_W && p[1] >= 0 && p[1] <= FIELD_H;
}

/** 물결이 기준점에서 앞으로 간 거리를 한 파장으로 접은 것 — 0 ≤ s < λ. */
function drift(t: number, c: WavefrontAndRayConstants): number {
  const s = (c.waveSpeed * t) % c.wavelength;
  return s < 0 ? s + c.wavelength : s;
}

// ------------------------------------------------------------------------
// 물결 장
// ------------------------------------------------------------------------

/** 물결 변위 cos φ — 행 우선, 첫 행이 월드 위쪽. 마루가 1, 골이 −1. */
export function waveField(t: number, d: number, c: WavefrontAndRayConstants): number[] {
  const [sx, sy] = sourcePos(d);
  const k = (2 * Math.PI) / c.wavelength;
  const omega = k * c.waveSpeed;
  const out = new Array<number>(COLS * ROWS);
  for (let row = 0; row < ROWS; row++) {
    const y = FIELD_H - (row + 0.5) * CELL;
    const dy = y - sy;
    for (let col = 0; col < COLS; col++) {
      const dx = (col + 0.5) * CELL - sx;
      const r = Math.sqrt(dx * dx + dy * dy);
      out[row * COLS + col] = Math.cos(k * (r - d) - omega * t);
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 파면 — 마루를 잇는 원호
// ------------------------------------------------------------------------

/** 판의 네 모서리. */
const CORNERS: readonly Vec2[] = [
  [0, 0],
  [FIELD_W, 0],
  [FIELD_W, FIELD_H],
  [0, FIELD_H],
];

/** 파원에서 판까지 가장 가까운 · 먼 거리. */
function reachOfField(s: Vec2): { min: number; max: number } {
  const nx = Math.min(Math.max(s[0], 0), FIELD_W);
  const ny = Math.min(Math.max(s[1], 0), FIELD_H);
  const min = Math.hypot(s[0] - nx, s[1] - ny);
  const max = Math.max(...CORNERS.map(([x, y]) => Math.hypot(x - s[0], y - s[1])));
  return { min, max };
}

/**
 * 판이 파원에서 보이는 각 범위. 파원이 판 안이면 한 바퀴 전부, 밖(왼쪽)이면 네 모서리를
 * 보는 각의 최소 · 최대다. 파원은 늘 판 왼쪽 가운데 높이라 각이 −π/2 ~ π/2 안에서 감기지 않는다.
 */
function angleSpan(s: Vec2): { from: number; to: number } {
  if (insideField(s)) return { from: 0, to: 2 * Math.PI };
  const angles = CORNERS.map(([x, y]) => Math.atan2(y - s[1], x - s[0]));
  return { from: Math.min(...angles), to: Math.max(...angles) };
}

/** 반지름 r 인 파면 한 줄(판이 보이는 각 범위만 표본). 판 밖 끝은 `clip` 이 자른다. */
export function arc(s: Vec2, r: number): Vec2[] {
  const { from, to } = angleSpan(s);
  const pts: Vec2[] = [];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const a = from + ((to - from) * i) / ARC_SAMPLES;
    pts.push([s[0] + r * Math.cos(a), s[1] + r * Math.sin(a)]);
  }
  return pts;
}

/**
 * 판에 걸친 마루 전부의 반지름. 파원 바로 곁의 아주 작은 원은 뺀다(점으로 뭉친다).
 * @param minRadius 이보다 작은 원은 그리지 않는다(월드)
 */
export function crestRadii(t: number, d: number, c: WavefrontAndRayConstants, minRadius: number): number[] {
  const { min, max } = reachOfField(sourcePos(d));
  const base = d + drift(t, c);
  const out: number[] = [];
  const n0 = Math.ceil((Math.max(min, minRadius) - base) / c.wavelength);
  for (let n = n0; base + n * c.wavelength <= max; n++) out.push(base + n * c.wavelength);
  return out;
}

/** 따라가는 파면이 옅어지는 가장자리 — 한 파장 중 양 끝 이만큼에서만 0 ↔ 1 로 바뀐다. */
const TRACK_FADE_EDGE = 0.15;

/**
 * 굵게 따라가는 파면 하나. 기준점 앞뒤 반 파장 사이를 지나는 마루이고, 한 파장을 다 가면
 * 다음 마루로 넘어간다. `fade` 는 그 사이의 짙기 — 양 끝에서만 0 으로 옅어져 넘어가는 순간이 튀지 않게.
 */
export function trackedCrest(t: number, d: number, c: WavefrontAndRayConstants): { r: number; fade: number } {
  const half = c.wavelength / 2;
  const f = (drift(t, c) + half) % c.wavelength;
  const edge = Math.min(f, c.wavelength - f) / (c.wavelength * TRACK_FADE_EDGE);
  return { r: d - half + f, fade: Math.min(1, edge) };
}

// ------------------------------------------------------------------------
// 광선
// ------------------------------------------------------------------------

export interface Ray {
  /** 광선의 단위 방향(월드). */
  dir: Vec2;
  /** 판 안에 보이는 시작 · 끝(월드). */
  start: Vec2;
  end: Vec2;
}

/**
 * 광선 다발. 파원에서 나와 기준 세로줄의 정해진 높이를 지난다 — 파원이 멀어져도 같은 다발이다.
 * @param sourceGap 파원이 판 안일 때 광선을 파원에서 띄우는 거리(월드)
 * @param endInset 판 끝에서 화살촉을 들이는 거리(월드)
 */
export function rays(d: number, sourceGap: number, endInset: number): Ray[] {
  const s = sourcePos(d);
  const inside = insideField(s);
  return RAY_OFFSETS.map((dy) => {
    const len = Math.hypot(d, dy);
    const ux = d / len;
    const uy = dy / len;
    // 시작 — 파원이 판 안이면 파원 곁, 밖이면 왼쪽 끝(x = 0)에 들어오는 자리.
    const s0 = inside ? sourceGap : -s[0] / ux;
    // 끝 — 오른쪽 · 위 · 아래 끝 중 먼저 닿는 곳.
    const exits = [(FIELD_W - s[0]) / ux];
    if (uy > 0) exits.push((FIELD_H - s[1]) / uy);
    if (uy < 0) exits.push(-s[1] / uy);
    const s1 = Math.min(...exits) - endInset;
    return {
      dir: [ux, uy] as Vec2,
      start: [s[0] + s0 * ux, s[1] + s0 * uy] as Vec2,
      end: [s[0] + s1 * ux, s[1] + s1 * uy] as Vec2,
    };
  });
}

/**
 * 광선과 반지름 r 파면이 만나는 자리의 직각 표지 — ㄱ자 세 점. 광선 뒤쪽(파원 쪽)으로 한 변,
 * 파면 접선 쪽으로 한 변. 만나는 자리가 판 밖이거나 광선의 보이는 구간 밖이면 없다.
 * @param size 표지 한 변(월드)
 */
export function rightAngleMark(d: number, ray: Ray, r: number, size: number): Vec2[] | null {
  const s = sourcePos(d);
  const p: Vec2 = [s[0] + r * ray.dir[0], s[1] + r * ray.dir[1]];
  if (!insideField(p)) return null;
  const along = (q: Vec2): number => (q[0] - s[0]) * ray.dir[0] + (q[1] - s[1]) * ray.dir[1];
  if (r - size < along(ray.start) || r > along(ray.end)) return null;
  const [ux, uy] = ray.dir;
  // 접선 — 광선을 반시계로 90° 돌린 방향.
  const tx = -uy;
  const ty = ux;
  return [
    [p[0] + size * tx, p[1] + size * ty],
    [p[0] + size * tx - size * ux, p[1] + size * ty - size * uy],
    [p[0] - size * ux, p[1] - size * uy],
  ];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: WavefrontAndRayState }): WavefrontAndRayState {
  return params.state;
}
