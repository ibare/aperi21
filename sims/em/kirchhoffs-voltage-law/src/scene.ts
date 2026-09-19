// ========================================================================
// kirchhoffs-voltage-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 —
//   고리: 전선(lineSet) → 전지 두 판(lineSet) → 저항 기호(circuitElement, 선언만) →
//         출발 표시(lineSet) → 전류 표식(vector)
//   판:   축(lineSet) → 귀환 강조선(lineSet) → 지난 바퀴의 옅은 계단 · 화살표 → 이번 바퀴의
//         전위 계단(lineSet) · 오르내림 화살표(vector)
//   걷는 점(particleSystem, 고리와 판에 하나씩) · 방향 화살표(vector) → 이름표(readout)
//
// 색은 뜻마다 하나다 — 전선 · 소자 · 축 · 계단 · 오르내림 화살표는 먹색, 걷는 점과 그
// 방향 화살표는 primary(고리 위의 점과 판 위의 점이 같은 것이다), **강조색은 「출발한
// 높이와 같다」 한 가지 뜻에만** — 한 바퀴를 마친 뒤 판의 0 V 기준선. 오름 · 내림은 색이
// 아니라 화살표의 위 · 아래 방향으로 가른다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  ELEMENTS,
  LOOP_PERIMETER,
  arcAtDistance,
  arcOf,
  crossings,
  pointAt,
  potentialAt,
  potentialIn,
  readConstants,
  solveLoop,
  spanWithout,
  staircase,
  subPath,
  walkNow,
  type Direction,
  type LoopElement,
} from './physics';
import {
  BATTERY_LONG_HALF,
  BATTERY_PLATE_GAP,
  BATTERY_SHORT_HALF,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  GRAPH_X0,
  GRAPH_Y0,
  LOOP_BOTTOM,
  RESISTOR_LEAD_HALF,
  SCENE_BOUNDS,
  START,
  text,
} from './schema';
import type { KirchhoffsVoltageLawState } from './state';

/** 전선 굵기(화면 px). */
const WIRE_PX = 2.5;
/** 전지 두 판의 굵기(화면 px). 짧은 판(−)을 더 굵게 긋는 관례를 따른다. */
const BATTERY_LONG_PX = 2.5;
const BATTERY_SHORT_PX = 4.5;
/** 출발 표시 — 도선을 가로지르는 짧은 막대의 반 길이(월드) · 굵기(화면 px). */
const START_TICK_HALF = 0.2;
const START_TICK_PX = 2.5;

/** 걷는 점 반지름(화면 px) · 방향 화살표 길이(월드) · 굵기(화면 px). */
const WALKER_PX = 5;
const HEADING_LEN = 0.6;
const HEADING_PX = 2.5;

/** 전류 표식 — 아래 변 안쪽, 화살표 가운데 x · 길이 · 도선에서 띄운 거리(월드) · 굵기(화면 px). */
const CURRENT_MARK_X = -2.2;
const CURRENT_MARK_LEN = 0.6;
const CURRENT_MARK_RISE = 0.3;
const CURRENT_MARK_PX = 2;
const CURRENT_LABEL_GAP = 0.24;

/**
 * 판 — 축 굵기(화면 px) · 세로축을 판 원점 왼쪽으로 띄우는 거리 · 가로축을 판 끝 너머로 내미는 길이 ·
 * 한 바퀴 눈금 반 길이(월드). 세로축을 띄우는 것은 첫 전지의 오름 화살표가 축에 붙지 않게 하려는 것이다.
 */
const AXIS_PX = 1.5;
const AXIS_PAD = 0.3;
const AXIS_OVERHANG = 0.3;
const LAP_TICK_HALF = 0.12;
/** 전위 계단 굵기(화면 px). */
const STAIR_PX = 3;
/** 오르내림 화살표 — 계단 오름 · 내림 앞에서 띄우는 거리(월드) · 굵기(화면 px). */
const DELTA_GAP = 0.16;
const DELTA_PX = 2;
/** 지난 바퀴(반대 방향)의 계단 · 화살표 불투명도. */
const GHOST_OPACITY = 0.3;
/** 귀환 강조선 굵기(화면 px). */
const EQUAL_PX = 4;

/** 이름표 글자 크기(화면 px) · 대상에서 띄우는 거리(월드). */
const LABEL_PX = 13;
const TAG_PX = 13;
const SIGN_PX = 15;
const RESISTOR_TAG_RISE = 0.36;
const BATTERY_VALUE_GAP = 0.6;
const BATTERY_TAG_GAP = 0.72;
const SIGN_GAP = 0.3;
const SIGN_RISE = 0.18;
const START_LABEL_GAP = 0.32;
const GRAPH_TAG_DROP = 0.3;
const GRAPH_LABEL_GAP = 0.14;
const GRAPH_TITLE_RISE = 0.3;

export function scene(params: {
  state: KirchhoffsVoltageLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('kirchhoffs-voltage-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const sol = solveLoop(c);
  const walk = walkNow(tl);
  const v0 = sol.nodeVoltages[0]!;
  const out: Primitive[] = [];

  /** 고리 위 자리(시계 방향 호길이) → 판 가로. */
  const gx = (s: number): number => GRAPH_X0 + (s / LOOP_PERIMETER) * GRAPH_WIDTH;
  const gy = (v: number): number => GRAPH_Y0 + v * c.voltHeight;

  // ================= 고리 =================

  // ---- 전선 — 전지 두 판 사이와 저항 기호 자리를 비우고 긋는다 ----
  const holes = ELEMENTS.map((el): [number, number] =>
    el.kind === 'battery' ? [el.span[0], el.span[1]] : [el.arc - RESISTOR_LEAD_HALF, el.arc + RESISTOR_LEAD_HALF],
  );
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: spanWithout(0, LOOP_PERIMETER, holes).map(([a, b]) => subPath(a, b)),
    width: WIRE_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 전지 — 두 판(G178). 둘 다 + 극(긴 판)이 시계 방향 앞쪽이다 ----
  for (const el of ELEMENTS) {
    if (el.kind === 'battery') out.push(...battery(el, c[el.id]));
  }

  // ---- 저항 — 값 글자는 선언한 스테이지 상수 그대로 ----
  for (const el of ELEMENTS) {
    if (el.kind !== 'resistor') continue;
    out.push({
      type: 'circuitElement',
      id: `resistor-${el.id}`,
      subtype: 'resistor',
      pos: [el.pos[0], el.pos[1]],
      rotation: 0,
      value: c[el.id],
      unit: 'Ω',
    });
    out.push(tagLabel(`tag-${el.id}`, [el.pos[0], el.pos[1] + RESISTOR_TAG_RISE], text(el.tag), 'center'));
  }

  // ---- 출발 표시 — 도선을 가로지르는 막대와 이름표(바깥쪽) ----
  const startAt = pointAt(arcOf(START));
  const startNormal: Vec2 = [startAt.dir[1], -startAt.dir[0]]; // 시계 방향 진행의 안쪽
  out.push({
    type: 'lineSet',
    id: 'start-tick',
    lines: [
      [
        [START[0] - startNormal[0] * START_TICK_HALF, START[1] - startNormal[1] * START_TICK_HALF],
        [START[0] + startNormal[0] * START_TICK_HALF, START[1] + startNormal[1] * START_TICK_HALF],
      ],
    ],
    width: START_TICK_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(
    nameLabel(
      'start-label',
      [START[0] - startNormal[0] * START_LABEL_GAP, START[1] - startNormal[1] * START_LABEL_GAP],
      text('label.start'),
      'right',
    ),
  );

  // ---- 전류 표식 — 관례 전류 방향. 아래 변 안쪽, 전류가 시계 방향이면 왼쪽을 본다 ----
  const currentSign = sol.current >= 0 ? -1 : 1;
  const markY = LOOP_BOTTOM + CURRENT_MARK_RISE;
  out.push({
    type: 'vector',
    id: 'current-mark',
    from: [CURRENT_MARK_X - (currentSign * CURRENT_MARK_LEN) / 2, markY],
    delta: [currentSign * CURRENT_MARK_LEN, 0],
    width: CURRENT_MARK_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push(tagLabel('current-label', [CURRENT_MARK_X, markY + CURRENT_LABEL_GAP], text('label.current'), 'center'));

  // ================= 전위 판 =================
  // 가로는 고리 위 자리(출발점에서 시계 방향 호길이). 거꾸로 도는 바퀴는 같은 계단을 오른쪽
  // 끝부터 되짚는다. 지난 바퀴(반대 방향)의 계단과 화살표는 옅게 남는다.

  // ---- 축 — 세로(전위, 원점에서 조금 띄움) · 가로(고리 위 자리) · 한 바퀴 눈금 ----
  const lapX = gx(LOOP_PERIMETER);
  const axisX = GRAPH_X0 - AXIS_PAD;
  out.push({
    type: 'lineSet',
    id: 'graph-axes',
    lines: [
      [
        [axisX, GRAPH_Y0 + GRAPH_HEIGHT],
        [axisX, GRAPH_Y0],
        [lapX + AXIS_OVERHANG, GRAPH_Y0],
      ],
      [
        [lapX, GRAPH_Y0 - LAP_TICK_HALF],
        [lapX, GRAPH_Y0 + LAP_TICK_HALF],
      ],
    ],
    width: AXIS_PX,
    style: { colorRole: 'ink', emphasis: 'medium' },
  });

  // ---- 귀환 — 한 바퀴를 마친 높이가 출발한 높이와 같다. 강조색은 이 뜻 하나 ----
  if (walk.home) {
    out.push({
      type: 'lineSet',
      id: 'equal-line',
      lines: [
        [
          [gx(0), gy(v0)],
          [lapX, gy(v0)],
        ],
      ],
      width: EQUAL_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 지난 바퀴(반대 방향) — 온 바퀴를 옅게 ----
  const other: Direction = walk.dir === 'cw' ? 'ccw' : 'cw';
  out.push(...lap('past', other, LOOP_PERIMETER, GHOST_OPACITY));

  // ---- 이번 바퀴 — 점이 지나온 곳까지. 방향을 바꾸는 동안은 아직 없다 ----
  if (!walk.turning) out.push(...lap('now', walk.dir, walk.distance, 1));

  // ---- 소자 이름표 — 가로축 아래, 그 소자의 자리 ----
  for (const el of ELEMENTS) {
    out.push(tagLabel(`graph-tag-${el.id}`, [gx(el.arc), GRAPH_Y0 - GRAPH_TAG_DROP], text(el.tag), 'center'));
  }

  // ---- 판 이름표 ----
  out.push(nameLabel('graph-potential', [axisX, GRAPH_Y0 + GRAPH_HEIGHT + GRAPH_TITLE_RISE], text('label.potential'), 'center'));
  out.push(nameLabel('graph-lap', [lapX + AXIS_OVERHANG + GRAPH_LABEL_GAP, GRAPH_Y0], text('label.lap'), 'left'));
  out.push(nameLabel('graph-start', [axisX - GRAPH_LABEL_GAP, GRAPH_Y0], text('label.start'), 'right'));

  // ================= 걷는 점 =================

  const hereArc = arcAtDistance(walk.dir, walk.distance);
  const here = pointAt(hereArc);
  const sign = walk.dir === 'cw' ? 1 : -1;
  out.push({
    type: 'vector',
    id: 'heading',
    from: here.pos,
    delta: [here.dir[0] * sign * HEADING_LEN, here.dir[1] * sign * HEADING_LEN],
    width: HEADING_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  const xs = crossings(walk.dir, sol);
  out.push({
    type: 'particleSystem',
    id: 'walker',
    positions: [here.pos, [gx(hereArc), gy(potentialAt(xs, v0, walk.distance))]],
    sizes: WALKER_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;

  /**
   * 한 방향으로 간 거리 `distance` 까지의 계단과 오르내림 화살표. 화살표는 그 방향으로 소자에
   * **들어가는 쪽** 옆에 선다 — 시계 방향은 오름 · 내림의 왼쪽, 반시계 방향은 오른쪽 — 그래서
   * 두 바퀴의 화살표가 소자마다 짝으로 나란히 선다.
   */
  function lap(tag: string, dir: Direction, distance: number, opacity: number): Primitive[] {
    const lapXs = crossings(dir, sol);
    const toX = (d: number): number => gx(arcAtDistance(dir, d));
    const side = dir === 'cw' ? -1 : 1;
    const prims: Primitive[] = [
      {
        type: 'lineSet',
        id: `stairs-${tag}`,
        lines: [staircase(lapXs, v0, distance).map(([d, v]): Vec2 => [toX(d), gy(v)])],
        width: STAIR_PX,
        opacity,
        style: { colorRole: 'ink', emphasis: 'strong' },
      },
    ];
    for (const x of lapXs) {
      if (distance <= x.d0) continue;
      const dy = gy(potentialIn(x, distance)) - gy(x.vBefore);
      if (Math.abs(dy) < 1e-6) continue;
      prims.push({
        type: 'vector',
        id: `delta-${tag}-${x.element.id}`,
        from: [toX(x.d0) + side * DELTA_GAP, gy(x.vBefore)],
        delta: [0, dy],
        width: DELTA_PX,
        opacity,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    return prims;
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}

/**
 * 전지 한 개 — 도선에 수직인 두 판, 극 표식은 고리 안쪽, 이름 표식은 더 안쪽, 전압 글자는 바깥쪽.
 * + 극(긴 판)은 시계 방향 앞쪽 판이다.
 */
function battery(el: LoopElement, volts: number): Primitive[] {
  const along = pointAt(el.arc).dir;
  const inward: Vec2 = [along[1], -along[0]];
  const plate = (s: number, half: number): Vec2[] => {
    const p = pointAt(s).pos;
    return [
      [p[0] - inward[0] * half, p[1] - inward[1] * half],
      [p[0] + inward[0] * half, p[1] + inward[1] * half],
    ];
  };
  const plusS = el.arc + BATTERY_PLATE_GAP / 2;
  const minusS = el.arc - BATTERY_PLATE_GAP / 2;
  const plusAt = pointAt(plusS).pos;
  const minusAt = pointAt(minusS).pos;
  const signAt = (p: Vec2, s: number): Vec2 => {
    const away = s > el.arc ? 1 : -1;
    return [p[0] + inward[0] * SIGN_GAP + along[0] * SIGN_RISE * away, p[1] + inward[1] * SIGN_GAP + along[1] * SIGN_RISE * away];
  };
  const inside: 'left' | 'right' = inward[0] >= 0 ? 'left' : 'right';
  const outside: 'left' | 'right' = inward[0] >= 0 ? 'right' : 'left';
  return [
    {
      type: 'lineSet',
      id: `battery-${el.id}-plus`,
      lines: [plate(plusS, BATTERY_LONG_HALF)],
      width: BATTERY_LONG_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'lineSet',
      id: `battery-${el.id}-minus`,
      lines: [plate(minusS, BATTERY_SHORT_HALF)],
      width: BATTERY_SHORT_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    signLabel(`battery-${el.id}-plus-sign`, signAt(plusAt, plusS), text('label.plus'), inside),
    signLabel(`battery-${el.id}-minus-sign`, signAt(minusAt, minusS), text('label.minus'), inside),
    tagLabel(`tag-${el.id}`, [el.pos[0] + inward[0] * BATTERY_TAG_GAP, el.pos[1] + inward[1] * BATTERY_TAG_GAP], text(el.tag), inside),
    {
      type: 'readout',
      id: `value-${el.id}`,
      anchor: { world: [el.pos[0] - inward[0] * BATTERY_VALUE_GAP, el.pos[1] - inward[1] * BATTERY_VALUE_GAP] },
      text: text('label.volt'),
      vars: { v: String(volts) },
      chip: false,
      fontSize: LABEL_PX,
      align: outside,
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

function nameLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function tagLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: TAG_PX,
    italic: true,
    align,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function signLabel(id: string, at: Vec2, label: LocalizedText, align: 'left' | 'center' | 'right'): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at },
    text: label,
    chip: false,
    fontSize: SIGN_PX,
    weight: 'bold',
    align,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}
