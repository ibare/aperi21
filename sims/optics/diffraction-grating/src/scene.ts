// ========================================================================
// diffraction-grating — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 격자 가운데가 원점, 겹침은 쓴 순서다(`drawOrder: 'scene'`).
//
// 색 —
// - 빛(들어오는 파면 · 스크린 띠)은 빛 채널에 파장 색(`wavelengthToLinearRgb`)으로, 흰빛 단계의 스크린은
//   `spectrumToLinearRgb` 로 칠한다. 파면 뒤에는 빛 없음 바탕을 깐다 — 흰 파면이 라이트 바탕에 묻히지 않게 (G92).
// - 가림벽 · 지금 세기 곡선은 `ink`, 0 기준선 · 주극대 안내선 · 앞 틈 수의 곡선(점선)은 `muted`.
// - 강조색은 쓰지 않는다 — 틈 수가 다른 두 곡선은 실선 · 점선으로 가른다.
// ========================================================================

import type {
  Body,
  Bounds,
  LineSet,
  Primitive,
  Region,
  SceneGraph,
  ScalarField,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { spectrumToLinearRgb, wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import {
  type DiffractionGratingConstants,
  gratingIntensity,
  openRanks,
  principalMaxima,
  readConstants,
  sinAt,
} from './physics';
import {
  BARRIER_T,
  CURVE_GAP,
  CURVE_W,
  GRATING_HALF,
  SCENE_BOUNDS,
  SCREEN_HALF,
  SCREEN_W,
  SLIT_OPEN_FRAC,
  WAVE_GAP,
  WAVE_HALF,
  WAVE_REACH,
  WAVE_STOP,
} from './schema';
import type { DiffractionGratingState } from './state';

// ------------------------------------------------------------------------
// 그림 치수 — 화면 px 는 위계라 배율을 따르지 않는다 (C2)
// ------------------------------------------------------------------------

/** 들어오는 파면 굵기. */
const WAVE_PX = 2;
/** 세기 곡선 · 앞 틈 수 곡선 · 0 기준선 · 주극대 안내선 굵기. */
const CURVE_PX = 1.8;
const GHOST_PX = 1.4;
const BASE_PX = 1;
const GUIDE_PX = 1;
/** 주극대 안내선 불투명도 — 곡선보다 뒤로 물러나 있어야 한다. */
const GUIDE_OPACITY = 0.55;
/** 빛 없음 바탕이 파면 범위 왼쪽으로 더 나가는 거리. */
const BACKDROP_PAD = 0.2;
/** 스크린 띠 · 곡선 표본 수(세로). 20 틈의 주극대 반폭에 대여섯 칸이 들도록. */
const SCREEN_ROWS = 720;
/** 이보다 좁게 열린 틈은 닫힌 것으로 본다 — 가림벽 토막 사이에 틈새 선이 남지 않게. */
const CLOSED_EPS = 1e-3;

const WHITE: readonly [number, number, number] = [1, 1, 1];

// ------------------------------------------------------------------------
// 도움 함수
// ------------------------------------------------------------------------

type Rgb = readonly [number, number, number];

const mixRgb = (a: Rgb, b: Rgb, s: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * s,
  a[1] + (b[1] - a[1]) * s,
  a[2] + (b[2] - a[2]) * s,
];

/** 곡선 기준선 x. */
function curveX0(L: number): number {
  return L + SCREEN_W + CURVE_GAP;
}

/** 스크린 i 번째 행의 높이(위에서부터). */
function rowY(i: number, rows: number): number {
  return SCREEN_HALF - (i * 2 * SCREEN_HALF) / rows;
}

/**
 * 틈 자리마다의 진폭 가중치. 순위가 `few` 보다 작은 자리는 늘 열려 있고, `mid` · `many` 까지의
 * 자리는 열린 정도 `aMid` · `aMany` 만큼 열린다.
 */
function weightsFor(ranks: readonly number[], c: DiffractionGratingConstants, aMid: number, aMany: number): number[] {
  return ranks.map((r) => (r < c.slitsFew ? 1 : r < c.slitsMid ? aMid : r < c.slitsMany ? aMany : 0));
}

// ------------------------------------------------------------------------
// 빛 · 장치
// ------------------------------------------------------------------------

/** 파면 뒤의 빛 없음 바탕. */
function backdrop(): Region {
  const x1 = -BARRIER_T / 2;
  const x0 = x1 - WAVE_REACH - BACKDROP_PAD;
  return {
    type: 'region',
    id: 'backdrop',
    points: [
      [x0, SCREEN_HALF],
      [x1, SCREEN_HALF],
      [x1, -SCREEN_HALF],
      [x0, -SCREEN_HALF],
    ],
    fillOpacity: 1,
    light: 0,
  };
}

/** 왼쪽에서 격자로 다가오는 평면 파면. */
function incoming(t: number, speed: number, rgb: Rgb): LineSet {
  const face = -BARRIER_T / 2;
  const x0 = face - WAVE_REACH;
  const x1 = face - WAVE_STOP;
  const s = ((((t * speed) / WAVE_GAP) % 1) + 1) % 1;
  const lines: Vec2[][] = [];
  for (let x = x0 + s * WAVE_GAP; x <= x1; x += WAVE_GAP) {
    lines.push([
      [x, -WAVE_HALF],
      [x, WAVE_HALF],
    ]);
  }
  return { type: 'lineSet', id: 'incoming', lines, width: WAVE_PX, light: { rgb } };
}

/** 가림벽 — 틈 자리마다 열린 높이만큼 비우고 나머지를 토막으로 세운다. */
function barrier(weights: readonly number[]): Body[] {
  const n = weights.length;
  const pitch = (2 * GRATING_HALF) / n;
  // 위에서 아래로 열린 구간 [top, bottom].
  const gaps: [number, number][] = [];
  weights.forEach((w, k) => {
    const half = (pitch * SLIT_OPEN_FRAC * w) / 2;
    if (half < CLOSED_EPS) return;
    const y = GRATING_HALF - (k + 0.5) * pitch;
    gaps.push([y + half, y - half]);
  });
  const out: Body[] = [];
  let top = SCREEN_HALF;
  const edges: [number, number][] = [];
  for (const [gTop, gBottom] of gaps) {
    edges.push([top, gTop]);
    top = gBottom;
  }
  edges.push([top, -SCREEN_HALF]);
  edges.forEach(([a, b], i) => {
    const h = a - b;
    if (h <= 0) return;
    out.push({
      type: 'body',
      id: `barrier-${i}`,
      shape: 'rect',
      pos: [0, (a + b) / 2],
      size: [BARRIER_T, h],
      outline: 'none',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });
  return out;
}

/**
 * 스크린 띠 — 행마다 그 방향의 세기로 빛을 칠한다. 한 색 빛은 파장 색 × 세기, 흰빛은 파장마다의
 * 세기를 스펙트럼으로 삼아 색을 얻는다. 둘을 `white` 만큼 섞는다.
 */
function screen(c: DiffractionGratingConstants, weights: readonly number[], mono: Rgb, white: number): ScalarField {
  const L = c.screenDistance;
  const values: number[] = [];
  for (let i = 0; i < SCREEN_ROWS; i++) {
    const s = sinAt(rowY(i + 0.5, SCREEN_ROWS), L);
    const v = gratingIntensity(weights, s, c.spacingNm, c.wavelengthNm);
    let rgb: Rgb = [mono[0] * v, mono[1] * v, mono[2] * v];
    if (white > 0) {
      const w = spectrumToLinearRgb((nm) => gratingIntensity(weights, s, c.spacingNm, nm));
      rgb = mixRgb(rgb, w, white);
    }
    values.push(rgb[0], rgb[1], rgb[2]);
  }
  return {
    type: 'scalarField',
    id: 'screen',
    min: [L, -SCREEN_HALF],
    max: [L + SCREEN_W, SCREEN_HALF],
    cols: 1,
    rows: SCREEN_ROWS,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  };
}

/** 세기 곡선의 점 — 틈 수마다 가장 밝은 곳이 폭 `CURVE_W`. */
function curvePoints(c: DiffractionGratingConstants, weights: readonly number[]): Vec2[] {
  const L = c.screenDistance;
  const x0 = curveX0(L);
  const pts: Vec2[] = [];
  for (let i = 0; i <= SCREEN_ROWS; i++) {
    const y = rowY(i, SCREEN_ROWS);
    pts.push([x0 + CURVE_W * gratingIntensity(weights, sinAt(y, L), c.spacingNm, c.wavelengthNm), y]);
  }
  return pts;
}

/** 주극대 자리 안내선 — 스크린 앞면부터 곡선 끝까지. 틈 수가 바뀌어도 그대로다. */
function guides(c: DiffractionGratingConstants, opacity: number): LineSet {
  const x0 = c.screenDistance;
  const x1 = curveX0(c.screenDistance) + CURVE_W;
  return {
    type: 'lineSet',
    id: 'guides',
    lines: principalMaxima(c, SCREEN_HALF).map((y) => [
      [x0, y],
      [x1, y],
    ]),
    width: GUIDE_PX,
    opacity: GUIDE_OPACITY * opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function zeroLine(L: number, opacity: number): Trajectory {
  const x0 = curveX0(L);
  return {
    type: 'trajectory',
    id: 'profile-zero',
    points: [
      [x0, SCREEN_HALF],
      [x0, -SCREEN_HALF],
    ],
    width: BASE_PX,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

// ------------------------------------------------------------------------
// 조립
// ------------------------------------------------------------------------

export function scene(params: {
  state: DiffractionGratingState;
  stage: StageDef;
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('diffraction-grating: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const L = c.screenDistance;

  // 되돌리기 단계가 열린 틈과 흰빛을 함께 거둔다.
  const back = 1 - tl.at('reset');
  const aMid = tl.at('open-mid') * back;
  const aMany = tl.at('open-many') * back;
  const white = tl.at('white-in') * back;
  const curveOpacity = 1 - white;

  const ranks = openRanks(c.slitsMany);
  const now = weightsFor(ranks, c, aMid, aMany);
  const mono = wavelengthToLinearRgb(c.wavelengthNm);

  const out: Primitive[] = [
    backdrop(),
    incoming(tl.t, c.waveSpeed, mixRgb(mono, WHITE, white)),
    ...barrier(now),
    screen(c, now, mono, white),
    guides(c, curveOpacity),
    zeroLine(L, curveOpacity),
  ];

  // 앞 틈 수의 곡선 — 늘리는 동안 나타나 다음 늘리기까지 점선으로 남는다.
  const ghostFew = tl.at('open-mid') * (1 - tl.at('open-many'));
  const ghostMid = tl.at('open-many') * curveOpacity;
  const ghost = (id: string, weights: readonly number[], opacity: number): Trajectory => ({
    type: 'trajectory',
    id,
    points: curvePoints(c, weights),
    width: GHOST_PX,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  if (ghostFew > 0) out.push(ghost('ghost-few', weightsFor(ranks, c, 0, 0), ghostFew));
  if (ghostMid > 0) out.push(ghost('ghost-mid', weightsFor(ranks, c, 1, 0), ghostMid));

  if (curveOpacity > 0) {
    out.push({
      type: 'trajectory',
      id: 'profile-curve',
      points: curvePoints(c, now),
      width: CURVE_PX,
      opacity: curveOpacity,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
