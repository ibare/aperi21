// ========================================================================
// resolving-power — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 가로축은 각이다 — 스크린 상과 그 아래 곡선이 같은 가로축을 나눠 쓰고,
// 월드 x = 각(μrad) × `imageScale`. 겹침은 쓴 순서다(`drawOrder: 'scene'`).
//
// 색 —
// - 빛(스크린 상 · 구멍을 채운 빛)은 빛 채널에 파장 색(`wavelengthToLinearRgb`)으로 칠한다. 스크린 상은
//   빛 없음이 늘 거의 검정이라 라이트 · 다크에서 어두운 자리가 같이 어둡다.
// - 두 점 표식 · 합 곡선 · 첫 어두운 자리 눈금 · 구멍 둘레는 `ink`, 점 하나의 무늬 곡선 둘 · 0 기준선 ·
//   봉우리 안내선 · 상의 틀 · 봉우리 높이선은 `muted`. 두 점의 무늬는 같은 대상이라 같은 색 · 같은 선이다.
// - 강조색(`accent`)은 「가운데 골의 깊이」 한 뜻에만 쓴다.
// ========================================================================

import type {
  Body,
  Bounds,
  LineSet,
  Primitive,
  SceneGraph,
  ScalarField,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { airy, firstDarkAngle, readConstants, type ResolvingPowerConstants } from './physics';
import {
  APERTURE_X,
  APERTURE_Y,
  IMG_BOTTOM,
  IMG_HALF_W,
  IMG_TOP,
  PROFILE_BASE,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ResolvingPowerState } from './state';

// ------------------------------------------------------------------------
// 그림 치수 — 화면 px 는 위계라 배율을 따르지 않는다 (C2)
// ------------------------------------------------------------------------

/** 합 곡선 · 점 하나의 무늬 곡선 · 0 기준선 굵기. */
const SUM_PX = 2.2;
const SINGLE_PX = 1.2;
const BASE_PX = 1;
/** 골 깊이 막대 굵기 · 봉우리 높이선 굵기. */
const DIP_PX = 3.2;
const PEAK_LINE_PX = 1;
/** 첫 어두운 자리 눈금 · 봉우리 안내선 굵기. */
const TICK_PX = 2.2;
const GUIDE_PX = 1;
/** 스크린 상 틀 · 구멍 지름선 굵기. */
const FRAME_PX = 1;
const DIAMETER_PX = 1;
/** 표식 글자 크기와 구멍 둘레에서 띄우는 화면 거리(px). */
const MARK_PX = 13;
const MARK_GAP_PX = 14;

/** 스크린 상 격자(가로 × 세로) — 월드 16 × 6 과 같은 비. */
const IMG_COLS = 256;
const IMG_ROWS = 96;
/** 곡선 표본 수. */
const PROFILE_SAMPLES = 281;
/** 첫 어두운 자리 눈금이 기준선 아래로 내려오는 길이(월드). */
const TICK_LEN = 0.45;
/** 두 점 표식 — 상 위로 띄운 거리와 반지름(월드). */
const POINT_LIFT = 0.4;
const POINT_R = 0.12;
/** 골이 이보다 얕으면(세기) 골이 없다고 보고 막대를 긋지 않는다. */
const DIP_MIN = 0.004;

// ------------------------------------------------------------------------
// 지금 배치 — 시간표에서 두 점의 간격과 구멍 지름을 읽는다
// ------------------------------------------------------------------------

interface Layout {
  /** 두 점의 각 간격(μrad). */
  sep: number;
  /** 지금 구멍 지름(mm). */
  d: number;
}

function layout(c: ResolvingPowerConstants, tl: TimelineFrame): Layout {
  const unit = firstDarkAngle(c.wavelengthNm, c.apertureSmall);
  const mult =
    c.sepFar +
    (c.sepRayleigh - c.sepFar) * tl.at('approach') +
    (c.sepNear - c.sepRayleigh) * tl.at('approach-more') +
    (c.sepFar - c.sepNear) * tl.at('reset');
  const d = c.apertureSmall + (c.apertureLarge - c.apertureSmall) * (tl.at('widen') - tl.at('reset'));
  return { sep: mult * unit, d };
}

/** 두 점 무늬의 세기 합 — 봉우리는 ±sep/2. */
function sumAt(theta: number, k: Layout, c: ResolvingPowerConstants): number {
  return airy(theta + k.sep / 2, c.wavelengthNm, k.d) + airy(theta - k.sep / 2, c.wavelengthNm, k.d);
}

// ------------------------------------------------------------------------
// 스크린 상
// ------------------------------------------------------------------------

function image(k: Layout, c: ResolvingPowerConstants, rgb: readonly [number, number, number]): ScalarField {
  const yc = (IMG_TOP + IMG_BOTTOM) / 2;
  const values: number[] = [];
  for (let r = 0; r < IMG_ROWS; r++) {
    const y = IMG_TOP - ((r + 0.5) * (IMG_TOP - IMG_BOTTOM)) / IMG_ROWS;
    const ty = (y - yc) / c.imageScale;
    for (let q = 0; q < IMG_COLS; q++) {
      const x = -IMG_HALF_W + ((q + 0.5) * 2 * IMG_HALF_W) / IMG_COLS;
      const tx = x / c.imageScale;
      const v =
        c.exposure *
        (airy(Math.hypot(tx + k.sep / 2, ty), c.wavelengthNm, k.d) +
          airy(Math.hypot(tx - k.sep / 2, ty), c.wavelengthNm, k.d));
      values.push(rgb[0] * v, rgb[1] * v, rgb[2] * v);
    }
  }
  return {
    type: 'scalarField',
    id: 'image',
    min: [-IMG_HALF_W, IMG_BOTTOM],
    max: [IMG_HALF_W, IMG_TOP],
    cols: IMG_COLS,
    rows: IMG_ROWS,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  };
}

/** 상의 틀 — 다크에서 빛 없음이 바탕에 묻혀 상의 경계가 사라지는 것을 막는다 (장부 G140). */
function imageFrame(): LineSet {
  return {
    type: 'lineSet',
    id: 'image-frame',
    lines: [
      [
        [-IMG_HALF_W, IMG_BOTTOM],
        [IMG_HALF_W, IMG_BOTTOM],
        [IMG_HALF_W, IMG_TOP],
        [-IMG_HALF_W, IMG_TOP],
        [-IMG_HALF_W, IMG_BOTTOM],
      ],
    ],
    width: FRAME_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
}

/** 두 점 표식 — 상 위에 두 점이 실제로 있는 자리. */
function points(xs: readonly number[]): Body[] {
  return xs.map((x, i) => ({
    type: 'body',
    id: `point-${i}`,
    shape: 'circle',
    pos: [x, IMG_TOP + POINT_LIFT],
    size: POINT_R,
    outline: 'none',
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  }));
}

// ------------------------------------------------------------------------
// 곡선 — 점 하나의 무늬 둘과 그 합
// ------------------------------------------------------------------------

function curve(id: string, f: (theta: number) => number, c: ResolvingPowerConstants, width: number, role: 'ink' | 'muted'): Trajectory {
  const pts: Vec2[] = [];
  for (let i = 0; i < PROFILE_SAMPLES; i++) {
    const x = -IMG_HALF_W + (i * 2 * IMG_HALF_W) / (PROFILE_SAMPLES - 1);
    pts.push([x, PROFILE_BASE + c.curveHeight * f(x / c.imageScale)]);
  }
  return { type: 'trajectory', id, points: pts, width, style: { colorRole: role, emphasis: 'strong' } };
}

function profile(k: Layout, c: ResolvingPowerConstants): Primitive[] {
  const lam = c.wavelengthNm;
  const out: Primitive[] = [
    {
      type: 'trajectory',
      id: 'profile-zero',
      points: [
        [-IMG_HALF_W, PROFILE_BASE],
        [IMG_HALF_W, PROFILE_BASE],
      ],
      width: BASE_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    curve('single-left', (t) => airy(t + k.sep / 2, lam, k.d), c, SINGLE_PX, 'muted'),
    curve('single-right', (t) => airy(t - k.sep / 2, lam, k.d), c, SINGLE_PX, 'muted'),
    curve('sum', (t) => sumAt(t, k, c), c, SUM_PX, 'ink'),
  ];

  // 가운데 골의 깊이 — 합 곡선의 봉우리 높이와 가운데 높이의 차. 골이 사라지면 막대도 사라진다.
  let peak = sumAt(0, k, c);
  let peakTheta = 0;
  for (let i = 1; i < PROFILE_SAMPLES; i++) {
    const theta = (i * IMG_HALF_W) / (PROFILE_SAMPLES - 1) / c.imageScale;
    const v = sumAt(theta, k, c);
    if (v > peak) {
      peak = v;
      peakTheta = theta;
    }
  }
  const mid = sumAt(0, k, c);
  if (peak - mid > DIP_MIN) {
    const yPeak = PROFILE_BASE + c.curveHeight * peak;
    const xp = peakTheta * c.imageScale;
    out.push({
      type: 'trajectory',
      id: 'peak-level',
      points: [
        [-xp, yPeak],
        [xp, yPeak],
      ],
      width: PEAK_LINE_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'lineSet',
      id: 'dip',
      lines: [
        [
          [0, PROFILE_BASE + c.curveHeight * mid],
          [0, yPeak],
        ],
      ],
      width: DIP_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  return out;
}

/**
 * 안쪽 첫 어두운 자리 눈금과 봉우리 안내선. 왼쪽 무늬의 첫 어두운 자리(오른쪽)와 오른쪽 무늬의 첫 어두운
 * 자리(왼쪽)에 눈금을 두고, 두 봉우리에서 점선을 내린다 — 레일리 단계에서 둘이 겹치고, 더 다가가면
 * 봉우리 점선이 눈금보다 안으로 들어간다.
 */
function darkTicks(k: Layout, c: ResolvingPowerConstants): Primitive[] {
  const z = firstDarkAngle(c.wavelengthNm, k.d);
  const xl = (-k.sep / 2) * c.imageScale;
  const xr = (k.sep / 2) * c.imageScale;
  const zeros = [(-k.sep / 2 + z) * c.imageScale, (k.sep / 2 - z) * c.imageScale];
  const out: Primitive[] = [
    {
      type: 'lineSet',
      id: 'dark-ticks',
      lines: zeros.map((x) => [
        [x, PROFILE_BASE],
        [x, PROFILE_BASE - TICK_LEN],
      ]),
      width: TICK_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
  [xl, xr].forEach((x, i) => {
    out.push({
      type: 'trajectory',
      id: `peak-guide-${i}`,
      points: [
        [x, PROFILE_BASE + c.curveHeight],
        [x, PROFILE_BASE - TICK_LEN],
      ],
      width: GUIDE_PX,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  });
  return out;
}

// ------------------------------------------------------------------------
// 구멍 — 정면에서 본 원형 구멍, 지름 D
// ------------------------------------------------------------------------

function aperture(k: Layout, c: ResolvingPowerConstants, rgb: readonly [number, number, number]): Primitive[] {
  const r = (k.d * c.apertureScale) / 2;
  const center: Vec2 = [APERTURE_X, APERTURE_Y];
  return [
    {
      type: 'body',
      id: 'aperture-light',
      shape: 'circle',
      pos: center,
      size: r,
      outline: 'none',
      glow: false,
      light: { rgb },
    },
    {
      type: 'body',
      id: 'aperture-rim',
      shape: 'circle',
      pos: center,
      size: r,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: 'aperture-diameter',
      lines: [
        [
          [APERTURE_X - r, APERTURE_Y],
          [APERTURE_X + r, APERTURE_Y],
        ],
      ],
      width: DIAMETER_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'aperture-mark',
      anchor: { world: [APERTURE_X, APERTURE_Y - r], offset: [0, MARK_GAP_PX] },
      text: text('mark.diameter'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: MARK_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  ];
}

// ------------------------------------------------------------------------
// 조립
// ------------------------------------------------------------------------

export function scene(params: {
  state: ResolvingPowerState;
  stage: StageDef;
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('resolving-power: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const rgb = wavelengthToLinearRgb(c.wavelengthNm);
  const k = layout(c, tl);
  const half = (k.sep / 2) * c.imageScale;

  return [
    image(k, c, rgb),
    imageFrame(),
    ...points([-half, half]),
    ...profile(k, c),
    ...darkTicks(k, c),
    ...aperture(k, c, rgb),
  ];
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
