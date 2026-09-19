// ========================================================================
// malus-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 세 칸이다.
//   왼쪽 — 정면에서 본 검광판(원 · 투과축과 나란한 결 · 축선)과 세로로 떨리는 들어온 진동(ink),
//          그 진동을 축에 투영한 축 방향 성분 화살표(primary). 성분 화살표의 길이가 cos 몫이다.
//   가운데 — 판을 지난 빛이 닿는 스크린. 빛의 세기 채널(`light`)로 칠해 두 테마에서 극성이 같다.
//   오른쪽 — 세기-각 판. 성분 몫 점선(primary)과 세기 몫 실선(accent), 두 곡선 위 지금 점,
//          그리고 정박 각마다 서는 세기 막대(accent). 막대가 점선 아래로 벌어지는 것이 주장이다.
//
// 색 — 같은 양은 같은 색이다. 성분(투영 길이)은 화살표든 점선이든 primary, 세기는 막대든 실선이든
// accent — 강조색은 「지난 세기」 한 뜻에만 쓴다. 판 · 축 · 눈금은 배경 정보라 muted.
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
  barStanding,
  barsOpacity,
  componentShare,
  holdIndex,
  intensityShare,
  plateDeg,
  readConstants,
} from './physics';
import {
  ANGLE_ARC_R,
  ANGLE_LABEL_R,
  BAR_HALF_W,
  CURVE_SAMPLES,
  HATCH_GAP,
  PLATE_CENTER,
  PLATE_R,
  PLOT_DEG_SPAN,
  PLOT_H,
  PLOT_PAD,
  PLOT_TOP_OVER,
  PLOT_W,
  PLOT_X0,
  PLOT_Y0,
  SCENE_BOUNDS,
  SCREEN_HALF_H,
  SCREEN_HALF_W,
  SCREEN_X,
  STOP_COUNT,
  TICK_LEN,
  VIB_HALF,
  text,
} from './schema';
import type { MalusLawState } from './state';

/** 이름표 · 값 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 판 이름 글자 크기(화면 px). */
const TITLE_PX = 13;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 12;
/** 눈금 글자를 축 아래로 띄우는 거리(화면 px). */
const TICK_LABEL_GAP = 14;
/** 막대 값 줄을 눈금 글자 줄 아래로 띄우는 거리(화면 px). */
const VALUE_ROW_GAP = 32;
/** 성분 값 글자를 지금 점 오른쪽 위로 띄우는 거리(화면 px). */
const COMPONENT_VALUE_OFFSET: Vec2 = [10, -9];
/** 판 이름을 둘레 왼쪽 위 모서리에서 띄우는 거리(화면 px). */
const TITLE_OFFSET: Vec2 = [-4, -4];
/** 판 이름이 붙는 둘레 위 자리(반지름 배수 · 45° 방향). */
const TITLE_AT = Math.SQRT1_2;
/** 성분 이름표를 성분 화살표 끝에서 띄우는 거리(화면 px) — 오른쪽 아래. */
const COMPONENT_LABEL_TIP_OFFSET: Vec2 = [10, 10];
/** 판 테두리 · 축선 · 곡선 · 성분 화살표 · 안내선 굵기(화면 px). */
const PLATE_EDGE_W = 1.5;
const AXIS_W = 2.6;
const HATCH_W = 1;
const CURVE_W = 2.2;
const COMPONENT_CURVE_W = 1.6;
const PLOT_AXIS_W = 1.2;
const GUIDE_W = 1;
const COMPONENT_W = 3.2;
/** 짙기. 판 채움 · 결 · 각 부채꼴 · 세운 막대 · 지금 막대. */
const PLATE_FILL = 0.06;
const HATCH_OPACITY = 0.35;
const SECTOR_FILL = 0.18;
const BAR_FILL = 0.32;
const LIVE_BAR_FILL = 0.7;
/** 지금 점 반지름(월드). */
const DOT_R = 0.075;
/** 판 테두리 표본 수. */
const RIM_SAMPLES = 72;
/** 곡선 이름표를 다는 각(°) — 두 곡선이 벌어져 있고 막대와 부딪히지 않는 자리. */
const COMPONENT_LABEL_DEG = 70;
const INTENSITY_LABEL_DEG = 15;
/** 곡선 이름표 띄움(화면 px) — 점선 위 오른쪽 · 실선 아래. */
const COMPONENT_LABEL_OFFSET: Vec2 = [8, -12];
const INTENSITY_LABEL_OFFSET: Vec2 = [0, 16];

const RAD = Math.PI / 180;

/** 판 위 자리 → 월드. */
function onPlate(x: number, y: number): Vec2 {
  return [PLATE_CENTER[0] + x, PLATE_CENTER[1] + y];
}

/** 세기-각 판의 월드 자리. */
function plotX(deg: number): number {
  return PLOT_X0 + PLOT_PAD + (deg / PLOT_DEG_SPAN) * PLOT_W;
}
function plotY(share: number): number {
  return PLOT_Y0 + share * PLOT_H;
}

export function scene(params: {
  state: MalusLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('malus-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const deg = plateDeg(timeline, c);
  const th = deg * RAD;
  const hold = holdIndex(timeline);
  const comp = componentShare(deg);
  const inten = intensityShare(deg);
  const degText = [state.deg0, state.deg1, state.deg2, state.deg3, state.deg4];
  const intText = [state.int0, state.int1, state.int2, state.int3, state.int4];
  const ampText = [state.amp0, state.amp1, state.amp2, state.amp3, state.amp4];
  const out: Primitive[] = [];

  // ================= 왼쪽 — 검광판과 진동 =================

  // 판 축 방향(세로에서 시계 방향으로 θ)과 그 법선.
  const d: Vec2 = [Math.sin(th), Math.cos(th)];
  const n: Vec2 = [Math.cos(th), -Math.sin(th)];

  const rim: Vec2[] = [];
  for (let i = 0; i < RIM_SAMPLES; i++) {
    const a = (i / RIM_SAMPLES) * Math.PI * 2;
    rim.push(onPlate(PLATE_R * Math.cos(a), PLATE_R * Math.sin(a)));
  }
  out.push({
    type: 'region',
    id: 'plate-fill',
    points: rim,
    fillOpacity: PLATE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 결 — 투과축과 나란한 줄. 판이 돌면 결도 함께 돈다(결 = 지나보내는 방향).
  const hatch: Vec2[][] = [];
  const hatchCount = Math.floor(PLATE_R / HATCH_GAP);
  for (let i = -hatchCount; i <= hatchCount; i++) {
    const o = i * HATCH_GAP;
    if (i === 0 || Math.abs(o) >= PLATE_R) continue; // 가운데는 축선이 긋는다.
    const half = Math.sqrt(PLATE_R * PLATE_R - o * o);
    hatch.push([
      onPlate(o * n[0] - half * d[0], o * n[1] - half * d[1]),
      onPlate(o * n[0] + half * d[0], o * n[1] + half * d[1]),
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'plate-hatch',
    lines: hatch,
    width: HATCH_W,
    opacity: HATCH_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'plate-rim',
    points: rim,
    closed: true,
    width: PLATE_EDGE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'plate-axis',
    points: [
      onPlate(-PLATE_R * d[0], -PLATE_R * d[1]),
      onPlate(PLATE_R * d[0], PLATE_R * d[1]),
    ],
    width: AXIS_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'plate-title',
    anchor: { world: onPlate(-PLATE_R * TITLE_AT, PLATE_R * TITLE_AT), offset: TITLE_OFFSET },
    text: text('label.analyzer'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: TITLE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 기운 각 — 세로(들어온 진동)에서 축까지 쓴 부채꼴. 각 글자는 정박해 있을 때만 선언값으로 쓴다.
  out.push({
    type: 'sector',
    id: 'plate-angle',
    center: onPlate(0, 0),
    radius: ANGLE_ARC_R,
    from: Math.PI / 2,
    to: Math.PI / 2 - th,
    fillOpacity: SECTOR_FILL,
    rimWidth: GUIDE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  if (hold > 0) {
    const mid = Math.PI / 2 - th / 2;
    out.push({
      type: 'readout',
      id: 'plate-angle-label',
      anchor: { world: onPlate(ANGLE_LABEL_R * Math.cos(mid), ANGLE_LABEL_R * Math.sin(mid)) },
      text: text('label.deg'),
      vars: { deg: degText[hold]! },
      chip: false,
      fontSize: LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 투영 — 진동 화살표 끝에서 축으로 내린 수선. 발까지가 축 방향 성분이다.
  const foot = VIB_HALF * comp;
  out.push({
    type: 'lineSet',
    id: 'projection-drop',
    lines: [
      [onPlate(0, VIB_HALF), onPlate(foot * d[0], foot * d[1])],
      [onPlate(0, -VIB_HALF), onPlate(-foot * d[0], -foot * d[1])],
    ],
    width: GUIDE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 들어온 진동 — 세로로 위아래 떨리는 폭. 두 화살표가 한 진동의 양 끝이다.
  out.push({
    type: 'vector',
    id: 'vibration-up',
    from: onPlate(0, 0),
    delta: [0, VIB_HALF],
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'vibration-label',
    anchor: { world: onPlate(0, PLATE_R), offset: [0, -LABEL_GAP] },
    text: text('label.vibration'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'vibration-down',
    from: onPlate(0, 0),
    delta: [0, -VIB_HALF],
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 축 방향 성분 — 판이 지나보내는 진동. 길이가 투영 몫이다.
  out.push({
    type: 'vector',
    id: 'component-up',
    from: onPlate(0, 0),
    delta: [foot * d[0], foot * d[1]],
    width: COMPONENT_W,
    outline: 'background',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'component-down',
    from: onPlate(0, 0),
    delta: [-foot * d[0], -foot * d[1]],
    width: COMPONENT_W,
    outline: 'background',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  // 성분 이름표 — 화살표 끝 오른쪽 아래. 직각에 머물러 성분이 없을 때는 달지 않는다.
  if (hold !== STOP_COUNT - 1) {
    out.push({
      type: 'readout',
      id: 'component-label',
      anchor: { world: onPlate(foot * d[0], foot * d[1]), offset: COMPONENT_LABEL_TIP_OFFSET },
      text: text('label.component'),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: LABEL_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ================= 가운데 — 스크린 =================

  const screen: Vec2[] = [
    [SCREEN_X - SCREEN_HALF_W, -SCREEN_HALF_H],
    [SCREEN_X + SCREEN_HALF_W, -SCREEN_HALF_H],
    [SCREEN_X + SCREEN_HALF_W, SCREEN_HALF_H],
    [SCREEN_X - SCREEN_HALF_W, SCREEN_HALF_H],
  ];
  out.push({
    type: 'region',
    id: 'screen',
    points: screen,
    fillOpacity: 1,
    light: inten,
  });
  out.push({
    type: 'trajectory',
    id: 'screen-edge',
    points: screen,
    closed: true,
    width: PLATE_EDGE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'screen-label',
    anchor: { world: [SCREEN_X, -SCREEN_HALF_H], offset: [0, LABEL_GAP] },
    text: text('label.screen'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ================= 오른쪽 — 세기-각 판 =================

  const xEnd = plotX(PLOT_DEG_SPAN) + PLOT_PAD;
  out.push({
    type: 'trajectory',
    id: 'plot-axes',
    points: [
      [PLOT_X0, plotY(1) + PLOT_TOP_OVER],
      [PLOT_X0, PLOT_Y0],
      [xEnd, PLOT_Y0],
    ],
    width: PLOT_AXIS_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'lineSet',
    id: 'plot-ticks',
    lines: c.deg.map((a) => [
      [plotX(a), PLOT_Y0],
      [plotX(a), PLOT_Y0 - TICK_LEN],
    ]),
    width: GUIDE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  for (let k = 0; k < STOP_COUNT; k++) {
    out.push({
      type: 'readout',
      id: `tick-label-${k}`,
      anchor: { world: [plotX(c.deg[k]!), PLOT_Y0 - TICK_LEN], offset: [0, TICK_LABEL_GAP] },
      text: text('label.deg'),
      vars: { deg: degText[k]! },
      chip: false,
      fontSize: LABEL_PX,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }
  out.push({
    type: 'readout',
    id: 'plot-theta',
    anchor: { world: [xEnd, PLOT_Y0], offset: [LABEL_GAP, 0] },
    text: text('label.theta'),
    chip: false,
    italic: true,
    fontSize: TITLE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 세운 막대 — 정박 각에 이르면 그 각의 세기 몫만큼 선다. 되돌리는 동안 사라진다.
  const fade = barsOpacity(timeline);
  for (let k = 0; k < STOP_COUNT; k++) {
    if (!barStanding(timeline, k)) continue;
    const a = c.deg[k]!;
    const top = plotY(intensityShare(a));
    out.push({
      type: 'region',
      id: `bar-${k}`,
      points: [
        [plotX(a) - BAR_HALF_W, PLOT_Y0],
        [plotX(a) + BAR_HALF_W, PLOT_Y0],
        [plotX(a) + BAR_HALF_W, top],
        [plotX(a) - BAR_HALF_W, top],
      ],
      fillOpacity: BAR_FILL,
      outline: [
        [1, 2],
        [2, 3],
        [3, 0],
      ],
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `bar-value-${k}`,
      anchor: { world: [plotX(a), PLOT_Y0 - TICK_LEN], offset: [0, VALUE_ROW_GAP] },
      text: text('label.value'),
      vars: { v: intText[k]! },
      chip: false,
      fontSize: LABEL_PX,
      weight: 'bold',
      opacity: fade,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 지금 막대 — 판 각을 따라 가로로 움직이며 지금 세기만큼 선다.
  out.push({
    type: 'region',
    id: 'live-bar',
    points: [
      [plotX(deg) - BAR_HALF_W, PLOT_Y0],
      [plotX(deg) + BAR_HALF_W, PLOT_Y0],
      [plotX(deg) + BAR_HALF_W, plotY(inten)],
      [plotX(deg) - BAR_HALF_W, plotY(inten)],
    ],
    fillOpacity: LIVE_BAR_FILL,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 두 곡선 — 성분 몫(점선)과 세기 몫(실선).
  const compCurve: Vec2[] = [];
  const intenCurve: Vec2[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const a = (i / CURVE_SAMPLES) * PLOT_DEG_SPAN;
    compCurve.push([plotX(a), plotY(componentShare(a))]);
    intenCurve.push([plotX(a), plotY(intensityShare(a))]);
  }
  out.push({
    type: 'trajectory',
    id: 'component-curve',
    points: compCurve,
    width: COMPONENT_CURVE_W,
    style: { colorRole: 'primary', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: 'intensity-curve',
    points: intenCurve,
    width: CURVE_W,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'component-curve-label',
    anchor: {
      world: [plotX(COMPONENT_LABEL_DEG), plotY(componentShare(COMPONENT_LABEL_DEG))],
      offset: COMPONENT_LABEL_OFFSET,
    },
    text: text('label.componentCurve'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'intensity-curve-label',
    anchor: {
      world: [plotX(INTENSITY_LABEL_DEG), plotY(intensityShare(INTENSITY_LABEL_DEG))],
      offset: INTENSITY_LABEL_OFFSET,
    },
    text: text('label.intensityCurve'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 지금 점 — 같은 각에서 성분(점선 위)과 세기(실선 위). 둘 사이 수직 안내선이 벌어진 몫이다.
  out.push({
    type: 'lineSet',
    id: 'now-gap',
    lines: [
      [
        [plotX(deg), plotY(inten)],
        [plotX(deg), plotY(comp)],
      ],
    ],
    width: GUIDE_W,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'now-component',
    pos: [plotX(deg), plotY(comp)],
    shape: 'circle',
    size: DOT_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'now-intensity',
    pos: [plotX(deg), plotY(inten)],
    shape: 'circle',
    size: DOT_R,
    glow: false,
    outline: 'background',
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  // 성분 값 — 정박해 있을 때만, 선언값 그대로. 아래 줄의 막대 값과 견주어 두 몫의 차이를 수로도 보인다.
  if (hold > 0 && hold < STOP_COUNT - 1) {
    out.push({
      type: 'readout',
      id: 'now-component-value',
      anchor: { world: [plotX(deg), plotY(comp)], offset: COMPONENT_VALUE_OFFSET },
      text: text('label.value'),
      vars: { v: ampText[hold]! },
      chip: false,
      align: 'left',
      fontSize: LABEL_PX,
      weight: 'bold',
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
