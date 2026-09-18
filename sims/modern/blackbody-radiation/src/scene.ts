// ========================================================================
// blackbody-radiation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 그래프 틀 — 축 · 천장 점선 · 가시광 경계 점선 · 눈금 · 띠 이름. 역할 색 muted.
//   · 무지개 띠 — 축 아래 얇은 `scalarField` `lightRgb`. 가시광이 어디인지(그 왼쪽이 자외선).
//   · 관측(플랑크) 곡선 — `trajectory` 먹색. 긴 파장에서 훑는 파장까지 자란다.
//   · 고전(레일리-진스) 곡선 — `trajectory` 강조색. 천장에서 끊긴다.
//   · 훑는 자리 — 두 곡선의 머리점, 그 사이 어긋남 점선.
//   · 천장 위 화살표 + ∞ — 천장을 뚫은 뒤에도 고전 이론이 계속 커진다는 것. 길이는 로그.
//
// **강조색은 「고전 이론」 한 뜻에만** — 곡선 · 머리점 · 화살표 · ∞ · 이름표.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { VISIBLE_NM, wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import {
  ceilingNm,
  drawingOpacity,
  observedLabelShown,
  overflowFraction,
  readConstants,
  relativeIntensities,
  sweepNm,
} from './physics';
import {
  ARROW_MAX,
  BAND_LABEL_NM,
  GRAPH_W,
  NM_AXIS,
  OBSERVED_LABEL_NM,
  PEAK_H,
  SCENE_BOUNDS,
  STRIP_H,
  TICK_LABEL_Y,
  WAVELENGTH_TICKS,
  text,
  type BlackbodyRadiationMessageKey,
} from './schema';
import type { BlackbodyRadiationState } from './state';

/** 곡선을 표본하는 간격(nm). 자외선 쪽 관측 곡선의 꺾임이 매끄러울 만큼. */
const CURVE_STEP_NM = 10;
/** 무지개 띠의 칸 수. 한 칸 5 nm. */
const STRIP_COLS = 80;
/** 두 곡선의 굵기(화면 px). 그림의 주인공 선이다. */
const CURVE_WIDTH = 2.5;
/** 축 · 눈금 · 경계선 · 어긋남 점선 굵기(화면 px). */
const GUIDE_WIDTH = 1;
/** 천장 위 화살표의 굵기(화면 px) — 곡선과 같은 대상이라 같은 굵기. */
const ARROW_WIDTH = 2.5;
/** 눈금 길이(월드). */
const TICK_LEN = 0.12;
/** 글자 크기(화면 px). */
const LABEL_PX = 11;
const CURVE_LABEL_PX = 12;
const INFINITY_PX = 18;
/** 이름표를 앵커에서 띄우는 자리(화면 px). */
const CLASSICAL_LABEL_OFFSET: Vec2 = [84, 12];
const OBSERVED_LABEL_OFFSET: Vec2 = [0, -38];
const INFINITY_OFFSET: Vec2 = [0, -12];
/** 세로축 이름 · 온도 글자 · 파장 축 이름의 월드 자리. 온도 글자는 천장에서 이만큼 위다. */
const INTENSITY_LABEL_X = -0.55;
const TEMPERATURE_X = 13.4;
const TEMPERATURE_RISE = 0.6;
const WAVELENGTH_LABEL_X = 13.85;

/** 파장 nm → 월드 x. */
function xOf(nm: number): number {
  return (nm / NM_AXIS) * GRAPH_W;
}

function label(
  id: string,
  pos: Vec2,
  key: BlackbodyRadiationMessageKey,
  opts: {
    vars?: Record<string, string>;
    fontSize?: number;
    role?: 'muted' | 'accent' | 'ink';
    offset?: Vec2;
    opacity?: number;
  } = {},
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: opts.offset ? { world: pos, offset: opts.offset } : { world: pos },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    fontSize: opts.fontSize ?? LABEL_PX,
    style: { colorRole: opts.role ?? 'muted', emphasis: 'strong' },
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

export function scene(params: {
  state: BlackbodyRadiationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('blackbody-radiation: 시간표가 없다');
  const c = readConstants(params.stage);
  const T = c.temperature;
  const ceilY = PEAK_H * c.ceilingRatio;
  const lam = sweepNm(tl, c);
  const alpha = drawingOpacity(tl);
  const out: Primitive[] = [];

  const obsY = (nm: number): number => PEAK_H * relativeIntensities(nm, T).observed;
  const clsY = (nm: number): number => PEAK_H * relativeIntensities(nm, T).classical;

  // ---- 무지개 띠 — 가시광이 어디인지 ----
  const lo = VISIBLE_NM.min;
  const hi = VISIBLE_NM.max;
  const colW = (hi - lo) / STRIP_COLS;
  out.push({
    type: 'scalarField',
    id: 'visible-strip',
    min: [xOf(lo), -STRIP_H],
    max: [xOf(hi), 0],
    cols: STRIP_COLS,
    rows: 1,
    values: Array.from({ length: STRIP_COLS }, (_, i) => wavelengthToLinearRgb(lo + (i + 0.5) * colW)).flatMap(
      (rgb) => [rgb[0], rgb[1], rgb[2]],
    ),
    range: [0, 1],
    colors: 'lightRgb',
  });

  // ---- 그래프 틀 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [0, ceilY],
      [0, 0],
      [GRAPH_W, 0],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'trajectory',
    id: 'ceiling',
    points: [
      [0, ceilY],
      [GRAPH_W, ceilY],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
  });
  for (const nm of [lo, hi]) {
    out.push({
      type: 'trajectory',
      id: `band-edge-${nm}`,
      points: [
        [xOf(nm), 0],
        [xOf(nm), ceilY],
      ],
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dotted' },
    });
  }
  out.push({
    type: 'lineSet',
    id: 'ticks',
    lines: WAVELENGTH_TICKS.map(({ nm }) => [
      [xOf(nm), 0],
      [xOf(nm), -TICK_LEN],
    ]),
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  WAVELENGTH_TICKS.forEach(({ nm, key }) => {
    out.push(label(`tick-${nm}`, [xOf(nm), TICK_LABEL_Y], key));
  });
  out.push(label('band-uv', [xOf(BAND_LABEL_NM.uv), TICK_LABEL_Y], 'label.uv'));
  out.push(label('band-visible', [xOf(BAND_LABEL_NM.visible), TICK_LABEL_Y], 'label.visible'));
  out.push(label('band-ir', [xOf(BAND_LABEL_NM.ir), TICK_LABEL_Y], 'label.ir'));
  out.push(label('wavelength-name', [WAVELENGTH_LABEL_X, TICK_LABEL_Y], 'label.wavelength'));
  out.push(label('intensity-name', [INTENSITY_LABEL_X, ceilY], 'label.intensity'));
  out.push(
    label('temperature', [TEMPERATURE_X, ceilY + TEMPERATURE_RISE], 'label.temperature', {
      vars: { t: String(T) },
      fontSize: CURVE_LABEL_PX,
      role: 'ink',
    }),
  );

  // ---- 두 곡선 — 긴 파장에서 지금 훑는 파장까지 ----
  const samples: number[] = [];
  for (let nm = c.nmStart; nm > lam; nm -= CURVE_STEP_NM) samples.push(nm);
  samples.push(lam);

  const exitNm = ceilingNm(c);
  const observed: Vec2[] = samples.map((nm) => [xOf(nm), obsY(nm)]);
  const classical: Vec2[] = [];
  for (const nm of samples) {
    if (nm < exitNm) {
      classical.push([xOf(exitNm), ceilY]);
      break;
    }
    classical.push([xOf(nm), clsY(nm)]);
  }

  if (observed.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'observed',
      points: observed,
      width: CURVE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (classical.length >= 2) {
    out.push({
      type: 'trajectory',
      id: 'classical',
      points: classical,
      width: CURVE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 훑는 자리 — 어긋남 점선 · 천장 위 화살표 ----
  const hx = xOf(lam);
  const hObs = obsY(lam);
  const hCls = clsY(lam);
  const above = hCls > ceilY;
  out.push({
    type: 'trajectory',
    id: 'gap',
    points: [
      [hx, hObs],
      [hx, Math.min(hCls, ceilY)],
    ],
    width: GUIDE_WIDTH,
    opacity: alpha,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  if (above) {
    const len = ARROW_MAX * overflowFraction(relativeIntensities(lam, T).classical, c);
    if (len > 0) {
      out.push({
        type: 'vector',
        id: 'overflow',
        from: [hx, ceilY],
        delta: [0, len],
        width: ARROW_WIDTH,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push(
      label('infinity', [hx, ceilY + len], 'label.infinity', {
        fontSize: INFINITY_PX,
        role: 'accent',
        offset: INFINITY_OFFSET,
        opacity: alpha,
      }),
    );
  } else {
    out.push({
      type: 'body',
      id: 'classical-head',
      pos: [hx, hCls],
      shape: 'point',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'body',
    id: 'observed-head',
    pos: [hx, hObs],
    shape: 'point',
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 곡선 이름표 — 곡선이 그 자리까지 그려진 뒤에 ----
  if (lam < exitNm) {
    out.push(
      label('classical-name', [xOf(exitNm), ceilY], 'label.classical', {
        fontSize: CURVE_LABEL_PX,
        role: 'accent',
        offset: CLASSICAL_LABEL_OFFSET,
        opacity: alpha,
      }),
    );
  }
  if (observedLabelShown(tl)) {
    out.push(
      label('observed-name', [xOf(OBSERVED_LABEL_NM), obsY(OBSERVED_LABEL_NM)], 'label.observed', {
        fontSize: CURVE_LABEL_PX,
        role: 'ink',
        offset: OBSERVED_LABEL_OFFSET,
        opacity: alpha,
      }),
    );
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
