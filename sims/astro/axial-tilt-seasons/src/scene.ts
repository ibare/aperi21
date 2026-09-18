// ========================================================================
// axial-tilt-seasons — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 — 비스듬히 위에서 본 궤도(trajectory 타원) · 가운데 태양(body, 빛 세기) · 궤도의 네 자리에
// 옅게 놓인 평행한 축(lineSet — 축이 같은 방향을 가리킨다는 것) · 도는 지구(scalarField `light`
// 명암 + sector 둘레) · 그 지구의 기운 축(trajectory) · 궤도면의 수직(점선) · 적도 앞쪽 반원.
// 오른쪽 — 북반구가 받는 햇빛 몫의 한 해 곡선(trajectory) · 절반 선 · 지금 점.
// 캡션은 선언의 캡션 슬롯이 그린다.
//
// 밝기 — 태양 · 지구 명암은 테마와 무관한 **빛의 세기**로 칠한다(햇빛 받는 쪽이 주장이다).
// 나머지(궤도 · 축 · 곡선 · 글자)는 역할 색. 강조색은 「지금」 하나에만 쓴다 — 곡선 위 지금 점과
// 도는 지구의 축이 같은 순간을 가리킨다.
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
import {
  AXIS_REACH,
  EARTH_CELLS,
  EARTH_R,
  GHOST_OPACITY,
  NORTH_LABEL_REACH,
  ORBIT,
  PLOT,
  PLOT_SHARE_RANGE,
  PLOT_TILT_Y,
  PLOT_TITLE_Y,
  PLOT_YEAR_Y,
  SCENE_BOUNDS,
  SUN_R,
  text,
} from './schema';
import {
  axisDirection,
  earthPosition3,
  earthShade,
  fractionAt,
  frontEquator,
  inFlatPart,
  northShare,
  orbitAngle,
  orbitAngleNow,
  project,
  readConstants,
  tiltNow,
  yearFractions,
} from './physics';
import type { AxialTiltSeasonsState } from './state';

/** 선 굵기(화면 px). 위계라 배율을 따르지 않는다. */
const ORBIT_WIDTH_PX = 1.2;
const GHOST_AXIS_WIDTH_PX = 1.2;
const AXIS_WIDTH_PX = 2.5;
const NORMAL_WIDTH_PX = 1;
const EQUATOR_WIDTH_PX = 1.2;
const OUTLINE_WIDTH_PX = 1;
const CURVE_WIDTH_PX = 2.2;
const GUIDE_WIDTH_PX = 1;
/** 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;
const SMALL_FONT_PX = 12;
/** 궤도 · 곡선 표본 수. */
const ORBIT_SAMPLES = 160;
const CURVE_SAMPLES = 180;
const EQUATOR_SAMPLES = 72;
/** 지금 점 크기(월드). */
const NOW_R = 4.5;
/** 태양 이름표를 태양 가장자리에서 띄우는 거리(월드). */
const SUN_LABEL_GAP = 22;
/** 궤도 이름표의 세로 자리(월드). */
const ORBIT_LABEL_Y = 326;
/** 곡선 세로축 이름표를 축에서 띄우는 거리(월드). */
const AXIS_LABEL_GAP = 24;
/** 여름 · 겨울 이름표를 봉우리 · 골짜기에서 띄우는 거리(월드). */
const SUMMER_LABEL_LIFT = 13;
const WINTER_LABEL_DROP = 14;

/** 궤도각 θ 에서 지구 가운데의 월드 자리. */
function earthCenter(theta: number): Vec2 {
  const [x, y] = project(earthPosition3(theta, ORBIT.R));
  return [ORBIT.cx + x, ORBIT.cy + y];
}

/** 지구 가운데에서 축 방향으로 반지름 × k 만큼 나간 자리. */
function alongAxis(center: Vec2, axis: Vec2, k: number): Vec2 {
  return [center[0] + axis[0] * EARTH_R * k, center[1] + axis[1] * EARTH_R * k];
}

/** 곡선 판 — 한 해의 몫 f 의 가로 자리, 햇빛 몫 v 의 세로 자리. */
function plotX(f: number): number {
  return PLOT.x0 + (PLOT.x1 - PLOT.x0) * f;
}
function plotY(v: number): number {
  return PLOT.midY + (v - 0.5) * PLOT.gain;
}

/** 한 해 곡선의 표본 — 0 에서 f 까지. */
function shareCurve(f: number, tiltDeg: number): Vec2[] {
  const n = Math.max(1, Math.ceil(CURVE_SAMPLES * f));
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const g = (f * k) / n;
    pts.push([plotX(g), plotY(northShare(orbitAngle(g), tiltDeg))]);
  }
  return pts;
}

export function scene(params: {
  state: AxialTiltSeasonsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('axial-tilt-seasons: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);

  const flatPart = inFlatPart(timeline);
  const years = yearFractions(timeline);
  const tilt = tiltNow(timeline, c);
  const theta = orbitAngleNow(timeline);
  const axis = project(axisDirection(tilt));
  const out: Primitive[] = [];

  // ---- 궤도 — 비스듬히 본 원(납작한 타원) ----
  const orbit: Vec2[] = [];
  for (let k = 0; k < ORBIT_SAMPLES; k++) orbit.push(earthCenter((2 * Math.PI * k) / ORBIT_SAMPLES));
  out.push({
    type: 'trajectory',
    id: 'orbit',
    points: orbit,
    closed: true,
    width: ORBIT_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 태양 — 가득 찬 빛. 라이트 바탕에 묻히지 않게 둘레는 선 색 (G92) ----
  const sun: Vec2 = [ORBIT.cx, ORBIT.cy];
  out.push({
    type: 'body',
    id: 'sun',
    pos: sun,
    shape: 'circle',
    size: SUN_R,
    glow: false,
    outline: 'line',
    light: 1,
  });
  out.push({
    type: 'readout',
    id: 'sun-label',
    anchor: { world: [ORBIT.cx + SUN_R + SUN_LABEL_GAP, ORBIT.cy] },
    text: text('label.sun'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 궤도 네 자리의 지구와 축 — 축이 모두 평행하다. 지금 기울기를 따른다 ----
  const ghostLines: Vec2[][] = [];
  for (let k = 0; k < 4; k++) {
    const at = earthCenter((k * Math.PI) / 2);
    ghostLines.push([alongAxis(at, axis, -AXIS_REACH), alongAxis(at, axis, AXIS_REACH)]);
    out.push({
      type: 'sector',
      id: `ghost-earth-${k}`,
      center: at,
      radius: EARTH_R,
      from: 0,
      to: 2 * Math.PI,
      fillOpacity: 0,
      rimWidth: GHOST_AXIS_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
  }
  out.push({
    type: 'lineSet',
    id: 'ghost-axes',
    lines: ghostLines,
    width: GHOST_AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'medium' },
  });

  // ---- 도는 지구 ----
  const e = earthCenter(theta);
  out.push({
    type: 'scalarField',
    id: 'earth-shade',
    min: [e[0] - EARTH_R, e[1] - EARTH_R],
    max: [e[0] + EARTH_R, e[1] + EARTH_R],
    cols: EARTH_CELLS,
    rows: EARTH_CELLS,
    values: earthShade(theta, EARTH_CELLS),
    range: [0, 1],
    colors: 'light',
  });
  out.push({
    type: 'sector',
    id: 'earth-outline',
    center: e,
    radius: EARTH_R,
    from: 0,
    to: 2 * Math.PI,
    fillOpacity: 0,
    rimWidth: OUTLINE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 적도 — 보는 사람 쪽 반원만.
  out.push({
    type: 'lineSet',
    id: 'equator',
    lines: frontEquator(tilt, EQUATOR_SAMPLES).map((run) =>
      run.map(([x, y]): Vec2 => [e[0] + x * EARTH_R, e[1] + y * EARTH_R]),
    ),
    width: EQUATOR_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 궤도면의 수직 — 축이 여기서 얼마나 기울었는지 재는 기준. 기울기 0 이면 축과 포개진다.
  const normal = project([0, 1, 0]);
  out.push({
    type: 'trajectory',
    id: 'orbit-normal',
    points: [alongAxis(e, normal, -AXIS_REACH), alongAxis(e, normal, AXIS_REACH)],
    width: NORMAL_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // 자전축 — 지금의 축. 강조색: 곡선 위 지금 점과 같은 순간이다.
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [alongAxis(e, axis, -AXIS_REACH), alongAxis(e, axis, AXIS_REACH)],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'north-label',
    anchor: { world: alongAxis(e, axis, NORTH_LABEL_REACH) },
    text: text('label.north'),
    chip: false,
    font: 'text',
    fontSize: SMALL_FONT_PX,
    weight: 'bold',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  out.push({
    type: 'readout',
    id: 'name-orbit',
    anchor: { world: [ORBIT.cx, ORBIT_LABEL_Y] },
    text: text('label.orbitView'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 북반구가 받는 햇빛 — 한 해 곡선 ----
  const [lo, hi] = PLOT_SHARE_RANGE;
  out.push({
    type: 'lineSet',
    id: 'plot-axes',
    lines: [
      [
        [PLOT.x0, plotY(hi)],
        [PLOT.x0, plotY(lo)],
        [PLOT.x1, plotY(lo)],
      ],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'half-line',
    points: [
      [PLOT.x0, plotY(0.5)],
      [PLOT.x1, plotY(0.5)],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const sideLabels: { id: string; key: 'label.more' | 'label.half' | 'label.less'; v: number }[] = [
    { id: 'plot-more', key: 'label.more', v: hi },
    { id: 'plot-half', key: 'label.half', v: 0.5 },
    { id: 'plot-less', key: 'label.less', v: lo },
  ];
  for (const s of sideLabels) {
    out.push({
      type: 'readout',
      id: s.id,
      anchor: { world: [PLOT.x0 - AXIS_LABEL_GAP, plotY(s.v)] },
      text: text(s.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 기운 해의 곡선 — 기운 해 동안 자라고, 그 뒤로는 옅게 남아 기울기 0 인 해와 견준다.
  const tiltedCurve = shareCurve(flatPart ? 1 : years.tilted, c.tilt);
  if (tiltedCurve.length > 1 && years.tilted > 0) {
    out.push({
      type: 'trajectory',
      id: 'curve-tilted',
      points: tiltedCurve,
      width: CURVE_WIDTH_PX,
      opacity: flatPart ? GHOST_OPACITY : 1,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  // 여름 · 겨울 — 기운 곡선의 봉우리 · 골짜기(태양의 왼쪽 · 오른쪽 자리) 곁. 곡선이 거기까지 자란 뒤에.
  const seasonMarks: { id: string; key: 'label.summer' | 'label.winter'; f: number; dy: number }[] = [
    { id: 'mark-summer', key: 'label.summer', f: fractionAt(Math.PI), dy: SUMMER_LABEL_LIFT },
    { id: 'mark-winter', key: 'label.winter', f: fractionAt(2 * Math.PI), dy: WINTER_LABEL_DROP },
  ];
  for (const m of seasonMarks) {
    if (!flatPart && years.tilted < m.f) continue;
    out.push({
      type: 'readout',
      id: m.id,
      anchor: { world: [plotX(m.f), plotY(northShare(orbitAngle(m.f), c.tilt)) + m.dy] },
      text: text(m.key),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      opacity: flatPart ? GHOST_OPACITY : 1,
      style: { colorRole: 'ink', emphasis: 'medium' },
    });
  }

  // 기울기 0 인 해의 곡선 — 기울기 0 인 해 동안 자란다.
  if (flatPart && years.flat > 0) {
    out.push({
      type: 'trajectory',
      id: 'curve-flat',
      points: shareCurve(years.flat, c.flatTilt),
      width: CURVE_WIDTH_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 지금 — 도는 지구가 지금 받는 몫. 축을 세우는 동안에는 해의 끝자리에서 오르내린다.
  const fNow = flatPart ? years.flat : years.tilted;
  out.push({
    type: 'body',
    id: 'now',
    pos: [plotX(fNow), plotY(northShare(theta, tilt))],
    shape: 'circle',
    size: NOW_R,
    glow: false,
    outline: 'none',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  out.push({
    type: 'dimension',
    id: 'one-year',
    from: [PLOT.x0, PLOT_YEAR_Y],
    to: [PLOT.x1, PLOT_YEAR_Y],
    text: text('label.year'),
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plot-title',
    anchor: { world: [(PLOT.x0 + PLOT.x1) / 2, PLOT_TITLE_Y] },
    text: text('label.shareTitle'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 지금 기울기 — 선언값 그대로. 옮겨 가는 동안에는 두지 않는다(중간값을 줄여 쓰지 않는다).
  const moving = timeline.phase === 'straighten' || timeline.phase === 'retilt';
  if (!moving) {
    out.push({
      type: 'readout',
      id: 'tilt-value',
      anchor: { world: [(PLOT.x0 + PLOT.x1) / 2, PLOT_TILT_Y] },
      text: text('label.tilt'),
      vars: { tilt: String(flatPart ? c.flatTilt : c.tilt) },
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      weight: 'bold',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
