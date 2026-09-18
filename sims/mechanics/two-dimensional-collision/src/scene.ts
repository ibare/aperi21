// ========================================================================
// two-dimensional-collision — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 두 공(`body`) · 운동량 화살표(`vector`) · 지나온 자취와
// 장부의 축 · 처음 합 표지(`trajectory`) · 이름(`readout`) 가 모두 표준 어휘로 있다.
//
// 색: A 는 먹색, B 는 보조색 — 서로 다른 두 대상이라 색이 갈리고, 그 공의 화살표와
// 장부의 성분도 같은 색을 따른다. 강조색은 **처음 합의 자리** 한 가지 뜻에만 쓴다.
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
import { derive, readConstants, type Reading } from './physics';
import {
  LEDGER_COL_X,
  LEDGER_COL_Y0,
  LEDGER_LANE,
  LEDGER_ROW_Y,
  LEDGER_X0,
  P_SCALE,
  RADIUS_A,
  RADIUS_B,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { TwoDimensionalCollisionState } from './state';

/** x 줄이 처음 합 너머로 더 뻗는 길이(월드). 끝이 줄 끝에 붙어 있으면 「더 갈 수 없어서 멈춘 것」 으로 읽힌다. */
const ROW_OVERHANG = 0.25;
/** 축이 0 자리 앞으로 나오는 길이(월드). */
const AXIS_LEAD = 0.12;
/** y 기둥의 반길이(월드). 세 각 모두 성분이 이 안에 든다. */
const COL_HALF = 0.72;
/** 0 눈금 · 처음 합 표지의 반길이(월드). */
const TICK_HALF = 0.08;
const TOTAL_HALF = 0.17;
/** 이름표를 축 · 표지에서 띄우는 거리(화면 px). */
const NAME_GAP = 9;
/** 화살표 굵기(화면 px). 공 위 화살표와 장부 성분이 같은 굵기다 — 같은 양이다. */
const ARROW_WIDTH = 3;

const pt = (x: number, y: number): Vec2 => [x, y];

/** 공 가장자리에서 화살표 방향으로 난 자리. 화살표가 0 이면 중심. */
const rim = (pos: Vec2, p: Vec2, radius: number): Vec2 => {
  const len = Math.hypot(p[0], p[1]);
  if (len < 1e-9) return pos;
  return [pos[0] + (p[0] / len) * radius, pos[1] + (p[1] / len) * radius];
};

export function scene(params: {
  state: TwoDimensionalCollisionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('two-dimensional-collision: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r: Reading = derive(timeline, c, params.state.impactAngle);
  const op = r.opacity;
  const inkA = { colorRole: 'ink', emphasis: 'strong' } as const;
  const roleB = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ================= 당구대 =================

  // ---- 지나온 자취 — 들어온 길과 갈라져 나간 두 길 ----
  const trail = (id: string, from: Vec2, to: Vec2): void => {
    g.push({
      type: 'trajectory',
      id,
      points: [from, to],
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dotted' },
    });
  };
  trail('trail-in', r.startA, r.separated ? r.contactA : r.posA);
  if (r.separated) {
    trail('trail-a', r.contactA, r.posA);
    trail('trail-b', [0, 0], r.posB);
  }

  // ---- 두 공 ----
  g.push({
    type: 'body',
    id: 'ball-b',
    pos: r.posB,
    shape: 'circle',
    size: RADIUS_B,
    glow: false,
    label: text('label.ballB'),
    opacity: op,
    style: roleB,
  });
  g.push({
    type: 'body',
    id: 'ball-a',
    pos: r.posA,
    shape: 'circle',
    size: RADIUS_A,
    glow: false,
    label: text('label.ballA'),
    opacity: op,
    style: inkA,
  });

  // ---- 공 위의 운동량 화살표 ----
  // 장부와 같은 배율이다 — 장부의 성분은 이 화살표의 그림자다. 꼬리는 공의 가장자리에
  // 둔다. 중심에서 내면 막 자라기 시작한 B 의 화살표가 공 안에 갇혀 보이지 않는다.
  g.push({
    type: 'vector',
    id: 'p-a',
    from: rim(r.posA, r.pA, RADIUS_A),
    delta: [r.pA[0] * P_SCALE, r.pA[1] * P_SCALE],
    width: ARROW_WIDTH,
    outline: 'background',
    opacity: op,
    style: inkA,
  });
  g.push({
    type: 'vector',
    id: 'p-b',
    from: rim(r.posB, r.pB, RADIUS_B),
    delta: [r.pB[0] * P_SCALE, r.pB[1] * P_SCALE],
    width: ARROW_WIDTH,
    outline: 'background',
    opacity: op,
    style: roleB,
  });

  // ================= 성분 장부 =================
  // x 성분은 가로 줄에, y 성분은 세로 기둥에. 성분을 제 방향 그대로 눕히고 세워야
  // 「위로 간 몫 · 아래로 간 몫」 이 방향으로 읽힌다. 두 공의 성분은 머리에 꼬리를
  // 잇는다 — 끝이 곧 합이다.

  // ---- x 줄 ----
  const xTotal = LEDGER_X0 + r.total[0] * P_SCALE;
  g.push({
    type: 'trajectory',
    id: 'x-axis',
    points: [pt(LEDGER_X0 - AXIS_LEAD, LEDGER_ROW_Y), pt(xTotal + ROW_OVERHANG, LEDGER_ROW_Y)],
    width: 1,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: 'x-zero',
    points: [pt(LEDGER_X0, LEDGER_ROW_Y - TICK_HALF), pt(LEDGER_X0, LEDGER_ROW_Y + TICK_HALF)],
    width: 1,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'readout',
    id: 'x-name',
    anchor: { world: pt(LEDGER_X0 - AXIS_LEAD, LEDGER_ROW_Y), offset: [-NAME_GAP, 0] },
    text: text('label.axisX'),
    chip: false,
    font: 'mono',
    italic: true,
    fontSize: 15,
    align: 'right',
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: 'x-total',
    points: [pt(xTotal, LEDGER_ROW_Y - TOTAL_HALF), pt(xTotal, LEDGER_ROW_Y + TOTAL_HALF)],
    width: 2,
    opacity: op,
    style: { ...accent, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'x-total-name',
    anchor: { world: pt(xTotal, LEDGER_ROW_Y + TOTAL_HALF), offset: [0, -NAME_GAP] },
    text: text('label.total'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'center',
    opacity: op,
    style: accent,
  });
  const axA = r.pA[0] * P_SCALE;
  g.push({
    type: 'vector',
    id: 'x-a',
    from: pt(LEDGER_X0, LEDGER_ROW_Y),
    delta: [axA, 0],
    width: ARROW_WIDTH,
    label: text('label.ballA'),
    labelSide: 'cw',
    opacity: op,
    style: inkA,
  });
  g.push({
    type: 'vector',
    id: 'x-b',
    from: pt(LEDGER_X0 + axA, LEDGER_ROW_Y),
    delta: [r.pB[0] * P_SCALE, 0],
    width: ARROW_WIDTH,
    label: text('label.ballB'),
    labelSide: 'cw',
    opacity: op,
    style: roleB,
  });

  // ---- y 기둥 ----
  const yTotal = LEDGER_COL_Y0 + r.total[1] * P_SCALE;
  g.push({
    type: 'trajectory',
    id: 'y-axis',
    points: [pt(LEDGER_COL_X, LEDGER_COL_Y0 - COL_HALF), pt(LEDGER_COL_X, LEDGER_COL_Y0 + COL_HALF)],
    width: 1,
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'readout',
    id: 'y-name',
    anchor: { world: pt(LEDGER_COL_X, LEDGER_COL_Y0 + COL_HALF), offset: [0, -NAME_GAP - 2] },
    text: text('label.axisY'),
    chip: false,
    font: 'mono',
    italic: true,
    fontSize: 15,
    align: 'center',
    opacity: op,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: 'y-total',
    points: [
      pt(LEDGER_COL_X - TOTAL_HALF - LEDGER_LANE, yTotal),
      pt(LEDGER_COL_X + TOTAL_HALF + LEDGER_LANE, yTotal),
    ],
    width: 2,
    opacity: op,
    style: { ...accent, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'y-total-name',
    anchor: { world: pt(LEDGER_COL_X + TOTAL_HALF + LEDGER_LANE, yTotal), offset: [NAME_GAP, 0] },
    text: text('label.total'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'left',
    opacity: op,
    style: accent,
  });
  const ayA = r.pA[1] * P_SCALE;
  // 두 성분을 잇는 가는 가로선 — A 의 머리에서 B 의 꼬리가 시작한다는 것.
  if (Math.abs(ayA) > 1e-3) {
    g.push({
      type: 'trajectory',
      id: 'y-link',
      points: [
        pt(LEDGER_COL_X - LEDGER_LANE, LEDGER_COL_Y0 + ayA),
        pt(LEDGER_COL_X + LEDGER_LANE, LEDGER_COL_Y0 + ayA),
      ],
      width: 1,
      opacity: op,
      style: { ...muted, lineStyle: 'dotted' },
    });
  }
  g.push({
    type: 'vector',
    id: 'y-a',
    from: pt(LEDGER_COL_X - LEDGER_LANE, LEDGER_COL_Y0),
    delta: [0, ayA],
    width: ARROW_WIDTH,
    label: text('label.ballA'),
    labelSide: 'ccw',
    opacity: op,
    style: inkA,
  });
  g.push({
    type: 'vector',
    id: 'y-b',
    from: pt(LEDGER_COL_X + LEDGER_LANE, LEDGER_COL_Y0 + ayA),
    delta: [0, r.pB[1] * P_SCALE],
    width: ARROW_WIDTH,
    label: text('label.ballB'),
    labelSide: 'ccw',
    opacity: op,
    style: roleB,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
