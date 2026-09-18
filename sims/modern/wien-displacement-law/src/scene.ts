// ========================================================================
// wien-displacement-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
//   · 그래프 틀 — 파장 축 · 세로축 · 눈금 · 눈금 글자 · 축 이름. 역할 색 muted.
//   · 지금 곡선 — `trajectory` 먹색. 봉우리 높이를 맞춘 플랑크 곡선, 온도가 오르면 원점 쪽으로 오그라든다.
//   · 잔상 곡선 — 지나온 온도의 곡선. muted.
//   · 봉우리 점 · 안내 점선 — 봉우리에서 제 막대 줄까지 곧게 올라간다.
//   · 봉우리 막대 — 그래프 위 세 줄. 원점에서 봉우리 파장까지. 강조색.
//   · 복사본 막대 — 새 막대와 같은 길이의 점선 막대가 미끄러져 이어 붙는다. 강조색.
//   · 줄 머리 — 그 온도의 빛 견본(`light: { rgb }`, plugin-optics)과 온도 글자.
//
// **강조색은 「봉우리 파장」 한 뜻에만** — 막대 · 복사본 · 지금 봉우리 점.
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
import { spectrumToLinearRgb } from '@aperi21/plugin-optics';
import { drawingOpacity, peakNm, readConstants, relativeIntensity, temperatureAt, type WienConstants } from './physics';
import {
  GRAPH_W,
  NM_AXIS,
  PEAK_H,
  ROW_BASE,
  ROW_GAP,
  SCENE_BOUNDS,
  TICK_LABEL_Y,
  WAVELENGTH_TICKS,
  text,
  type WienDisplacementLawMessageKey,
} from './schema';
import type { WienDisplacementLawState } from './state';

/** 곡선을 표본하는 간격(nm)과 시작 파장(nm). 가장 뜨거운 곡선(봉우리 약 240 nm)의 앞머리가 매끄러울 만큼. */
const CURVE_STEP_NM = 5;
const CURVE_START_NM = 20;
/** 막대 줄의 수 — 온도 셋. 위에서부터 첫 · 둘째 · 셋째 온도 (목록 길이가 코드에 있다, NOTES (c) G105). */
const ROW_COUNT = 3;
/** 곡선 굵기(화면 px). 지금 곡선이 주인공이다. */
const CURVE_WIDTH = 2.5;
const GHOST_WIDTH = 1.5;
/** 막대 굵기(화면 px). 선이 아니라 잴 수 있는 막대로 읽혀야 한다. */
const BAR_WIDTH = 4;
/** 축 · 눈금 · 안내 점선 · 막대 끝 눈금 굵기(화면 px). */
const GUIDE_WIDTH = 1;
/** 눈금 길이(월드)와 막대 끝 눈금의 반높이(월드). */
const TICK_LEN = 0.12;
const CAP_HALF = 0.12;
/** 세로축이 봉우리 위로 더 올라가는 길이(월드). */
const AXIS_OVERSHOOT = 0.15;
/** 글자 크기(화면 px). */
const LABEL_PX = 11;
const HEADER_PX = 12;
/** 줄 머리의 월드 x — 빛 견본 원판과 온도 글자. */
const SWATCH_X = -2.05;
const SWATCH_R = 0.13;
const HEADER_X = -1.0;
/** 축 이름의 월드 자리. 세기 이름은 곡선이 없는 오른쪽 위에 둔다. */
const WAVELENGTH_LABEL_X = 13.4;
const INTENSITY_LABEL_POS: Vec2 = [11.2, 2.45];

/** 막대 줄 하나 — 그 온도, 그 온도로 오르는 진행도, 복사본이 미끄러진 진행도. */
interface Row {
  T: number;
  heat: number;
  copy: number;
}

/** 파장 nm → 월드 x. */
function xOf(nm: number): number {
  return (nm / NM_AXIS) * GRAPH_W;
}

/** 막대 줄 k(0 = 첫 온도, 맨 위)의 월드 y. */
function rowY(k: number): number {
  return PEAK_H + ROW_BASE + (ROW_COUNT - 1 - k) * ROW_GAP;
}

/** 그 온도의 곡선 점들. 축 끝에서 끊는다. */
function curvePoints(T: number, c: WienConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let nm = CURVE_START_NM; nm <= NM_AXIS; nm += CURVE_STEP_NM) {
    pts.push([xOf(nm), PEAK_H * relativeIntensity(nm, T, c)]);
  }
  return pts;
}

/** 그 온도의 흑체 빛 색 — 가장 큰 성분을 1 로 맞춘다. 색만 말하고 밝기는 말하지 않는다. */
function blackbodyRgb(T: number, c: WienConstants): readonly [number, number, number] {
  const rgb = spectrumToLinearRgb((nm) => relativeIntensity(nm, T, c));
  const m = Math.max(rgb[0], rgb[1], rgb[2]);
  return m > 0 ? [rgb[0] / m, rgb[1] / m, rgb[2] / m] : [0, 0, 0];
}

function label(
  id: string,
  pos: Vec2,
  key: WienDisplacementLawMessageKey,
  opts: { vars?: Record<string, string>; fontSize?: number; role?: 'muted' | 'ink'; opacity?: number } = {},
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
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
  state: WienDisplacementLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('wien-displacement-law: 시간표가 없다');
  const c = readConstants(params.stage);
  const T = temperatureAt(tl, c);
  const alpha = drawingOpacity(tl);
  const out: Primitive[] = [];

  // ---- 그래프 틀 ----
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [0, PEAK_H + AXIS_OVERSHOOT],
      [0, 0],
      [GRAPH_W, 0],
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
  out.push(label('wavelength-name', [WAVELENGTH_LABEL_X, TICK_LABEL_Y], 'label.wavelength'));
  out.push(label('intensity-name', INTENSITY_LABEL_POS, 'label.intensity'));

  // ---- 세 온도 줄 ----
  // 줄의 막대는 그 온도로 오르기 시작하면 나타나고, 오르는 동안 지금 봉우리를 따라 줄어든다.
  const rows: readonly Row[] = [
    { T: c.tFirst, heat: 1, copy: 0 },
    { T: c.tSecond, heat: tl.at('heat1'), copy: tl.at('copy1') },
    { T: c.tThird, heat: tl.at('heat2'), copy: tl.at('copy2') },
  ];
  // 지나왔거나 지금 오르고 있는 줄만 선다. 마지막 줄이 지금 곡선의 줄이다.
  const shown = rows.filter((r) => r.heat > 0);
  const current = shown.length - 1;
  // 줄의 막대가 지금 재는 온도 — 오르는 중이면 지금 온도, 다 올랐으면 그 줄의 온도.
  const rowT = (r: Row): number => (r.heat < 1 ? T : r.T);

  // 안내 점선 — 봉우리에서 제 막대 줄까지 곧게. 막대 끝이 곧 봉우리 파장임을 잇는다.
  shown.forEach((r, k) => {
    const x = xOf(peakNm(rowT(r), c));
    out.push({
      type: 'trajectory',
      id: `guide-${k}`,
      points: [
        [x, PEAK_H],
        [x, rowY(k)],
      ],
      width: GUIDE_WIDTH,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dotted' },
    });
  });

  // 잔상 곡선 — 지나온 온도.
  shown.slice(0, current).forEach((r, k) => {
    out.push({
      type: 'trajectory',
      id: `ghost-${k}`,
      points: curvePoints(r.T, c),
      width: GHOST_WIDTH,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
    out.push({
      type: 'body',
      id: `ghost-peak-${k}`,
      pos: [xOf(peakNm(r.T, c)), PEAK_H],
      shape: 'point',
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  });

  // 지금 곡선과 봉우리.
  out.push({
    type: 'trajectory',
    id: 'curve',
    points: curvePoints(T, c),
    width: CURVE_WIDTH,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'peak',
    pos: [xOf(peakNm(T, c)), PEAK_H],
    shape: 'point',
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 봉우리 막대 · 복사본 ----
  const caps: [Vec2, Vec2][] = [];
  const cap = (x: number, y: number): void => {
    caps.push([
      [x, y - CAP_HALF],
      [x, y + CAP_HALF],
    ]);
  };
  shown.forEach((r, k) => {
    const y = rowY(k);
    const x1 = xOf(peakNm(rowT(r), c));
    out.push({
      type: 'trajectory',
      id: `bar-${k}`,
      points: [
        [0, y],
        [x1, y],
      ],
      width: BAR_WIDTH,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    cap(0, y);
    cap(x1, y);
    // 복사본 — 같은 길이를 한 번 더. 제 길이만큼 미끄러져 앞 막대의 끝에 닿는다.
    if (r.copy > 0) {
      const shift = x1 * r.copy;
      out.push({
        type: 'trajectory',
        id: `copy-${k}`,
        points: [
          [shift, y],
          [shift + x1, y],
        ],
        width: BAR_WIDTH,
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
      cap(shift + x1, y);
    }
    // 줄 머리 — 온도 글자는 그 온도에 다 오른 뒤에만, 선언값 그대로 (S-piece 유효숫자).
    if (r.heat >= 1) {
      out.push({
        type: 'body',
        id: `swatch-${k}`,
        pos: [SWATCH_X, y],
        shape: 'circle',
        size: SWATCH_R,
        glow: false,
        outline: 'line',
        light: { rgb: blackbodyRgb(r.T, c) },
        opacity: alpha,
      });
      out.push(
        label(`temperature-${k}`, [HEADER_X, y], 'label.temperature', {
          vars: { t: String(r.T) },
          fontSize: HEADER_PX,
          role: 'ink',
          opacity: alpha,
        }),
      );
    }
  });
  out.push({
    type: 'lineSet',
    id: 'bar-caps',
    lines: caps,
    width: GUIDE_WIDTH,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
