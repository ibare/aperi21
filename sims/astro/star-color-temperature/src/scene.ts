// ========================================================================
// star-color-temperature — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 밤하늘 판 — `region` 빛 없음(`light: 0`). 흰 별이 라이트 미색 바탕에 묻히지 않게 (G92).
//   · 별 — `body` circle, 빛의 색 `light: { rgb }` = 플랑크 스펙트럼을 눈으로 본 색.
//   · 곡선 — `trajectory` 먹색. 봉우리 높이를 온도마다 같게 맞춘 모양.
//   · 가시광 몫 — 곡선 아래 380~780 nm 를 `scalarField` `lightRgb` 로 파장마다 제 색. 곡선 위 칸은 NaN.
//   · 띠 밖 몫 — 자외선 · 적외선 쪽 곡선 아래는 `region` muted 옅은 칠. 눈에 들지 않는 몫이다.
//   · 무지개 띠 — 축 아래 얇은 `scalarField` `lightRgb`. 곡선이 낮은 자리에서도 가시광 구간이 보이게.
//   · 봉우리 — 강조색 점선 + 점 + 이름표. **강조색은 「봉우리」 한 뜻에만.**
//
// 빛은 별 · 가시광 칠 · 무지개 띠뿐이다. 축 · 눈금 · 곡선 · 글자 · 캡션은 역할 색 그대로다.
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
  blackbodyRgb,
  heldTemperature,
  peakNm,
  readConstants,
  relativeIntensity,
  temperatureAt,
} from './physics';
import {
  AXIS_TOP,
  BAND_LABEL_Y,
  GRAPH_W,
  GRAPH_X0,
  NM_MAX,
  PEAK_H,
  SCENE_BOUNDS,
  SKY_MAX,
  SKY_MIN,
  STAR_POS,
  STAR_R,
  STRIP_H,
  TEMP_LABEL_Y,
  TICK_LABEL_Y,
  WAVELENGTH_TICKS,
  text,
  type StarColorTemperatureMessageKey,
} from './schema';
import type { StarColorTemperatureState } from './state';

/** 곡선을 표본하는 간격(nm)과 시작 파장 — 0 nm 는 식이 발산해 조금 떨어져 시작한다. */
const CURVE_STEP_NM = 8;
const CURVE_START_NM = 40;
/** 가시광 칠의 칸 수. 가로 5 nm 한 칸, 세로는 곡선 윗변이 계단지지 않을 만큼. */
const FILL_COLS = 80;
const FILL_ROWS = 120;
/** 띠 밖 몫의 칠 짙기. 눈에 들지 않는 빛이라 옅게. */
const OUTSIDE_FILL = 0.2;
/** 곡선 굵기(화면 px). 그림의 주인공 선이다. */
const CURVE_WIDTH = 2.5;
/** 축 · 눈금 · 띠 경계선 굵기(화면 px). */
const GUIDE_WIDTH = 1;
/** 눈금 길이(월드). */
const TICK_LEN = 0.12;
/** 글자 크기(화면 px). */
const LABEL_PX = 11;
const TEMP_PX = 13;
/** 「봉우리」 이름표를 봉우리 점에서 띄우는 자리(화면 px). */
const PEAK_LABEL_OFFSET: [number, number] = [26, -8];

/** 파장 nm → 월드 x. */
function xOf(nm: number): number {
  return GRAPH_X0 + (nm / NM_MAX) * GRAPH_W;
}

function label(
  id: string,
  pos: Vec2,
  key: StarColorTemperatureMessageKey,
  opts: { vars?: Record<string, string>; fontSize?: number; role?: 'muted' | 'accent' | 'ink'; offset?: Vec2 } = {},
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
  };
}

export function scene(params: {
  state: StarColorTemperatureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('star-color-temperature: 시간표가 없다');
  const c = readConstants(params.stage);
  const T = temperatureAt(tl, c);
  const out: Primitive[] = [];

  // ---- 밤하늘 판과 별 ----
  out.push({
    type: 'region',
    id: 'sky',
    points: [SKY_MIN, [SKY_MAX[0], SKY_MIN[1]], SKY_MAX, [SKY_MIN[0], SKY_MAX[1]]],
    light: 0,
    fillOpacity: 1,
  });
  out.push({
    type: 'body',
    id: 'star',
    pos: STAR_POS,
    shape: 'circle',
    size: STAR_R,
    outline: 'none',
    glow: true,
    light: { rgb: blackbodyRgb(T) },
  });
  const held = heldTemperature(tl, c);
  if (held !== null) {
    out.push(
      label('temperature', [STAR_POS[0], TEMP_LABEL_Y], 'label.temperature', {
        vars: { t: String(held) },
        fontSize: TEMP_PX,
        role: 'ink',
      }),
    );
  }

  // ---- 곡선 아래 칠 ----
  const h = (nm: number): number => PEAK_H * relativeIntensity(nm, T);
  const lo = VISIBLE_NM.min;
  const hi = VISIBLE_NM.max;

  // 띠 밖 몫: 자외선 쪽 · 적외선 쪽 곡선 아래.
  const underCurve = (from: number, to: number): Vec2[] => {
    const pts: Vec2[] = [[xOf(from), 0]];
    for (let nm = from; nm < to; nm += CURVE_STEP_NM) pts.push([xOf(nm), h(nm)]);
    pts.push([xOf(to), h(to)], [xOf(to), 0]);
    return pts;
  };
  out.push({
    type: 'region',
    id: 'share-uv',
    points: underCurve(CURVE_START_NM, lo),
    fillOpacity: OUTSIDE_FILL,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
  out.push({
    type: 'region',
    id: 'share-ir',
    points: underCurve(hi, NM_MAX),
    fillOpacity: OUTSIDE_FILL,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // 가시광 몫: 칸마다 그 파장의 색, 곡선 위 칸은 비운다. 첫 행이 위쪽이다.
  const colW = (hi - lo) / FILL_COLS;
  const bandColors = Array.from({ length: FILL_COLS }, (_, i) => wavelengthToLinearRgb(lo + (i + 0.5) * colW));
  const fill: number[] = [];
  for (let r = 0; r < FILL_ROWS; r++) {
    const y = AXIS_TOP * (1 - (r + 0.5) / FILL_ROWS);
    for (let i = 0; i < FILL_COLS; i++) {
      const top = h(lo + (i + 0.5) * colW);
      const rgb = bandColors[i]!;
      if (y <= top) fill.push(rgb[0], rgb[1], rgb[2]);
      else fill.push(NaN, NaN, NaN);
    }
  }
  out.push({
    type: 'scalarField',
    id: 'share-visible',
    min: [xOf(lo), 0],
    max: [xOf(hi), AXIS_TOP],
    cols: FILL_COLS,
    rows: FILL_ROWS,
    values: fill,
    range: [0, 1],
    colors: 'lightRgb',
  });

  // 축 아래 무지개 띠 — 가시광 구간이 어디인지.
  out.push({
    type: 'scalarField',
    id: 'visible-strip',
    min: [xOf(lo), -STRIP_H],
    max: [xOf(hi), 0],
    cols: FILL_COLS,
    rows: 1,
    values: bandColors.flatMap((rgb) => [rgb[0], rgb[1], rgb[2]]),
    range: [0, 1],
    colors: 'lightRgb',
  });

  // ---- 축 · 눈금 · 띠 경계 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [GRAPH_X0, AXIS_TOP],
      [GRAPH_X0, 0],
      [GRAPH_X0 + GRAPH_W, 0],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });
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
  for (const nm of [lo, hi]) {
    out.push({
      type: 'trajectory',
      id: `band-edge-${nm}`,
      points: [
        [xOf(nm), 0],
        [xOf(nm), AXIS_TOP],
      ],
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dashed' },
    });
  }
  out.push(label('band-uv', [(GRAPH_X0 + xOf(lo)) / 2, BAND_LABEL_Y], 'label.uv'));
  out.push(label('band-visible', [(xOf(lo) + xOf(hi)) / 2, BAND_LABEL_Y], 'label.visible'));
  out.push(label('band-ir', [(xOf(hi) + GRAPH_X0 + GRAPH_W) / 2, BAND_LABEL_Y], 'label.ir'));

  // ---- 복사 곡선 ----
  const curve: Vec2[] = [];
  for (let nm = CURVE_START_NM; nm <= NM_MAX; nm += CURVE_STEP_NM) curve.push([xOf(nm), h(nm)]);
  out.push({
    type: 'trajectory',
    id: 'curve',
    points: curve,
    width: CURVE_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 봉우리 ----
  const px = xOf(peakNm(T));
  out.push({
    type: 'trajectory',
    id: 'peak-line',
    points: [
      [px, 0],
      [px, PEAK_H],
    ],
    width: GUIDE_WIDTH,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'body',
    id: 'peak-dot',
    pos: [px, PEAK_H],
    shape: 'point',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(label('peak-name', [px, PEAK_H], 'label.peak', { role: 'accent', offset: PEAK_LABEL_OFFSET }));

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
