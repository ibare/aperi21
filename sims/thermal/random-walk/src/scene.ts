// ========================================================================
// random-walk — 장면 선언
// ========================================================================
// 그리지 않고 선언한다. 캔버스 · 색 · 좌표 변환을 만지지 않는다 (S-sim).
//
// 가운데 — 걷는 이들. 한 사람이 한 줄(레인)을 쓰고 가로 자리가 처음 자리에서 몇 칸인가다.
// 아래 — 수직선(10 칸마다 눈금)과 걸음 막대. 막대 길이가 걸은 걸음 수에 비례한다.
// 위 — 폭 괄호. 멈출 때마다 선언한 제곱평균 거리(±칸)에 긋는다.
//
// 걸음 번호 = `walkFirst` · `walkSecond` 진행도 × 그 단계의 걸음 수. 나타남 · 사라짐은
// `gather` · `mark*` · `clear` 단계의 진행도다 — 단계 안을 코드로 가르지 않는다 (S-piece).
//
// 색은 뜻마다 하나. 걷는 이는 primary, 강조색은 「흩어진 폭」 한 뜻(괄호 · 그 이름표),
// 걸음 막대는 secondary. 지난 폭은 같은 강조색의 점선이다 — 같은 양을 다른 때 잰 것이라서다.
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { positionAt, readConstants } from './physics';
import {
  AXIS_HALF,
  AXIS_Y,
  BAR_LABEL_Y,
  BAR_X0,
  BAR_Y0,
  BAR_Y1,
  BRACKET_DROP,
  BRACKET_FIRST_Y,
  BRACKET_SECOND_Y,
  LANE_BASE,
  LANE_GAP,
  ORIGIN_LABEL_Y,
  SCENE_BOUNDS,
  TICK_EVERY,
  TICK_HALF,
  text,
} from './schema';
import type { RandomWalkState } from './state';

/** 걷는 이 점 반지름(화면 px). */
const WALKER_PX = 3;
/** 수직선 굵기 · 눈금 길이(월드) · 눈금 굵기(화면 px). */
const AXIS_WIDTH_PX = 1;
const TICK_LEN = 1.2;
const TICK_WIDTH_PX = 1;
/** 처음 자리 점선 — 굵기(화면 px) · 짙기 · 맨 위 레인 위로 더 긋는 길이(월드). */
const ORIGIN_WIDTH_PX = 1;
const ORIGIN_OPACITY = 0.6;
const ORIGIN_OVERSHOOT = 1;
/** 폭 괄호 굵기(화면 px) · 지난 폭 점선의 짙기. */
const BRACKET_WIDTH_PX = 2;
const GHOST_OPACITY = 0.75;
/** 괄호 이름표를 괄호 오른쪽 끝에서 띄우는 거리(화면 px). */
const SPREAD_LABEL_GAP_PX = 6;
/** 걸음 막대 채움 · 금 굵기(화면 px) · 금이 막대 위아래로 삐져나오는 길이(월드). */
const BAR_FILL = 0.55;
const CUT_WIDTH_PX = 1.5;
const CUT_OVERHANG = 0.5;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 11;
const SPREAD_LABEL_PX = 12;

/** 괄호 모양 — 양 끝이 아래로 꺾인 가로선. */
function bracket(half: number, y: number): Vec2[] {
  return [
    [-half, y - BRACKET_DROP],
    [-half, y],
    [half, y],
    [half, y - BRACKET_DROP],
  ];
}

export function scene(params: {
  state: RandomWalkState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('random-walk: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];

  const k = tl.at('walkFirst') * c.stepsFirst + tl.at('walkSecond') * (c.stepsSecond - c.stepsFirst);
  const fadeOut = 1 - tl.at('clear');
  const show = tl.at('gather') * fadeOut;
  const topLane = LANE_BASE + (c.walkers - 1) * LANE_GAP;

  // --- 수직선 · 눈금 · 처음 자리 -----------------------------------------
  out.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [-AXIS_HALF, AXIS_Y],
      [AXIS_HALF, AXIS_Y],
    ],
    width: AXIS_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const ticks: { pos: Vec2 }[] = [];
  for (let x = -TICK_HALF; x <= TICK_HALF; x += TICK_EVERY) ticks.push({ pos: [x, AXIS_Y] });
  out.push({
    type: 'trace',
    id: 'ticks',
    marks: ticks,
    shape: 'tick',
    size: TICK_LEN,
    direction: [0, 1],
    width: TICK_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'origin-line',
    points: [
      [0, AXIS_Y],
      [0, topLane + ORIGIN_OVERSHOOT],
    ],
    width: ORIGIN_WIDTH_PX,
    opacity: ORIGIN_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'readout',
    id: 'origin-label',
    anchor: { world: [0, ORIGIN_LABEL_Y] },
    text: text('label.origin'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // --- 걷는 이들 ----------------------------------------------------------
  if (show > 0) {
    const walkers: Vec2[] = [];
    for (let i = 0; i < c.walkers; i++) walkers.push([positionAt(state, i, k), LANE_BASE + i * LANE_GAP]);
    out.push({
      type: 'particleSystem',
      id: 'walkers',
      positions: walkers,
      sizes: WALKER_PX,
      opacity: show,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // --- 폭 괄호 ------------------------------------------------------------
  // 첫 폭 — 멈춤에서 벌어지고, 다시 걷기 시작하면 점선으로 남는다(지난 폭).
  const firstIn = tl.at('markFirst') * fadeOut;
  if (firstIn > 0) {
    const past = tl.at('walkSecond') > 0;
    const half = c.spreadFirst * tl.at('markFirst');
    if (past) {
      out.push({
        type: 'trajectory',
        id: 'spread-first',
        points: bracket(half, BRACKET_FIRST_Y),
        width: BRACKET_WIDTH_PX,
        opacity: GHOST_OPACITY * firstIn,
        style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
      });
    } else {
      out.push({
        type: 'lineSet',
        id: 'spread-first',
        lines: [bracket(half, BRACKET_FIRST_Y)],
        width: BRACKET_WIDTH_PX,
        opacity: firstIn,
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
    out.push({
      type: 'readout',
      id: 'spread-first-label',
      anchor: { world: [half, BRACKET_FIRST_Y], offset: [SPREAD_LABEL_GAP_PX, 0] },
      text: text('label.spread'),
      vars: { d: state.spreadFirstText },
      chip: false,
      font: 'text',
      fontSize: SPREAD_LABEL_PX,
      align: 'left',
      opacity: (past ? GHOST_OPACITY : 1) * firstIn,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  const secondIn = tl.at('markSecond') * fadeOut;
  if (secondIn > 0) {
    const half = c.spreadSecond * tl.at('markSecond');
    out.push({
      type: 'lineSet',
      id: 'spread-second',
      lines: [bracket(half, BRACKET_SECOND_Y)],
      width: BRACKET_WIDTH_PX,
      opacity: secondIn,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'spread-second-label',
      anchor: { world: [half, BRACKET_SECOND_Y], offset: [SPREAD_LABEL_GAP_PX, 0] },
      text: text('label.spread'),
      vars: { d: state.spreadSecondText },
      chip: false,
      font: 'text',
      fontSize: SPREAD_LABEL_PX,
      align: 'left',
      opacity: secondIn,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // --- 걸음 막대 ----------------------------------------------------------
  const barEnd = BAR_X0 + k * c.barScale;
  if (k > 0 && show > 0) {
    out.push({
      type: 'region',
      id: 'step-bar',
      points: [
        [BAR_X0, BAR_Y0],
        [barEnd, BAR_Y0],
        [barEnd, BAR_Y1],
        [BAR_X0, BAR_Y1],
      ],
      fillOpacity: BAR_FILL,
      opacity: show,
      style: { colorRole: 'secondary', emphasis: 'strong' },
    });
  }

  // 금 — 첫 멈춤의 걸음 수마다. 막대가 그 자리를 지나면 남는다.
  const cutsIn = tl.at('markFirst') * fadeOut;
  if (cutsIn > 0) {
    const cuts: Vec2[][] = [];
    for (let j = 1; j * c.stepsFirst <= k; j++) {
      const x = BAR_X0 + j * c.stepsFirst * c.barScale;
      cuts.push([
        [x, BAR_Y0 - CUT_OVERHANG],
        [x, BAR_Y1 + CUT_OVERHANG],
      ]);
    }
    out.push({
      type: 'lineSet',
      id: 'step-cuts',
      lines: cuts,
      width: CUT_WIDTH_PX,
      opacity: cutsIn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'steps-first-label',
      anchor: { world: [BAR_X0 + c.stepsFirst * c.barScale, BAR_LABEL_Y] },
      text: text('label.steps'),
      vars: { n: state.stepsFirstText },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: cutsIn,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
  if (secondIn > 0) {
    out.push({
      type: 'readout',
      id: 'steps-second-label',
      anchor: { world: [BAR_X0 + c.stepsSecond * c.barScale, BAR_LABEL_Y] },
      text: text('label.steps'),
      vars: { n: state.stepsSecondText },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'right',
      opacity: secondIn,
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
