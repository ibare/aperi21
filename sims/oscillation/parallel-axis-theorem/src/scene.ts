// ========================================================================
// parallel-axis-theorem — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 돈 각(`sector`) · 원판 테두리 · 축 · 질량 중심
// (`body`) · 표시선 · 질량 중심의 자취 · 돌림힘 원호(`trajectory`) · 원호 촉과
// 막대 칸(`region`) · 이름표(`readout`)가 모두 표준 어휘로 있다.
//
// 색: 두 원판 · 표시선 · 축은 먹색(같은 물체), 부채꼴과 막대의 아래 칸은 같은
// 보조색(둘 다 「가운데 축이면 이만큼」). 강조색은 **축을 옮겨서 더해진 것**
// 한 가지 뜻에만 쓴다 — 질량 중심이 그리는 반지름 d 원과 막대 위의 Md² 조각.
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
  AXIS_Y,
  BAR_BASE_Y,
  BAR_CENTER_X,
  BAR_FULL,
  BAR_HALF_W,
  BAR_SHIFTED_X,
  CENTER_AXIS_X,
  MARK_START_ANGLE,
  NAME_Y,
  OFFSET_START_ANGLE,
  SCENE_BOUNDS,
  SHIFTED_AXIS_X,
  SWEEP_RADIUS,
  TORQUE_ARC_RADIUS,
  text,
  type ParallelAxisTheoremMessageKey,
} from './schema';
import type { ParallelAxisTheoremState } from './state';

/** 축 · 질량 중심 점의 반지름(m). */
const AXIS_DOT = 0.034;
const CM_RING = 0.05;
/** 처음 방향 표지가 부채꼴 밖으로 나가는 길이(m). */
const START_OVERHANG = 0.1;
/** 돌림힘 원호 — 시작 · 끝 각(라디안, 반시계)과 촉 크기(m). */
const TORQUE_FROM = (-150 * Math.PI) / 180;
const TORQUE_TO = (100 * Math.PI) / 180;
const HEAD_LEN = 0.075;
const HEAD_HALF_W = 0.042;
/** τ 글자를 원호 시작점 바깥으로 띄우는 거리(m). */
const TORQUE_LABEL_GAP = 0.09;
/** 원 표본 수. */
const CIRCLE_SAMPLES = 96;
/** d 글자를 팔에서 수직으로 띄우는 거리(화면 px). */
const ARM_LABEL_OFFSET = 11;
/** 막대 이름을 바닥 아래로 내리는 거리(화면 px). */
const BASE_LABEL_OFFSET: Vec2 = [0, 15];
/** 칸 이름표를 막대 옆으로 띄우는 거리(화면 px). */
const SIDE_LABEL_GAP = 8;
/** 칸 이름표를 붙이는 최소 칸 높이(m). 이보다 얇으면 글자가 칸보다 두꺼워진다. */
const SEGMENT_LABEL_MIN = 0.09;
/** 같은 높이 점선이 막대 밖으로 나가는 길이(m). */
const LEVEL_OVERHANG = 0.08;

const dir = (a: number): Vec2 => [Math.cos(a), Math.sin(a)];
const add = (p: Vec2, v: Vec2, k = 1): Vec2 => [p[0] + v[0] * k, p[1] + v[1] * k];

const rect = (cx: number, halfW: number, yFrom: number, yTo: number): Vec2[] => [
  [cx - halfW, yFrom],
  [cx + halfW, yFrom],
  [cx + halfW, yTo],
  [cx - halfW, yTo],
];

function arc(center: Vec2, radius: number, from: number, to: number): Vec2[] {
  const n = Math.max(2, Math.ceil((Math.abs(to - from) / (2 * Math.PI)) * CIRCLE_SAMPLES));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) pts.push(add(center, dir(from + ((to - from) * i) / n), radius));
  return pts;
}

export function scene(params: {
  state: ParallelAxisTheoremState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('parallel-axis-theorem: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r: Reading = derive(timeline, c, params.state.offsetRatio);
  const op = r.opacity;
  const R = c.radius;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const bar = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  const centerAxis: Vec2 = [CENTER_AXIS_X, AXIS_Y];
  const shiftedAxis: Vec2 = [SHIFTED_AXIS_X, AXIS_Y];
  const shiftedCm = add(shiftedAxis, dir(OFFSET_START_ANGLE + r.thetaShifted), r.d);

  const discs: readonly {
    id: string;
    axis: Vec2;
    cm: Vec2;
    theta: number;
    name: ParallelAxisTheoremMessageKey;
  }[] = [
    { id: 'center', axis: centerAxis, cm: centerAxis, theta: r.thetaCenter, name: 'label.centerAxis' },
    { id: 'shifted', axis: shiftedAxis, cm: shiftedCm, theta: r.thetaShifted, name: 'label.shiftedAxis' },
  ];

  for (const disc of discs) {
    // ---- 돈 각 ----
    // 원판마다 제 질량 중심에 같은 반지름 · 같은 출발 방향으로 둔다 — 강체는 어느 점
    // 둘레로 재도 같은 각을 돈다. 뒤처진 만큼이 부채꼴 폭의 차이로 남는다.
    g.push({
      type: 'trajectory',
      id: `${disc.id}-start`,
      points: [disc.cm, add(disc.cm, dir(MARK_START_ANGLE), SWEEP_RADIUS + START_OVERHANG)],
      width: 1,
      opacity: op * 0.8,
      style: { ...muted, lineStyle: 'dashed' },
    });
    g.push({
      type: 'sector',
      id: `${disc.id}-sweep`,
      center: disc.cm,
      radius: SWEEP_RADIUS,
      from: MARK_START_ANGLE,
      to: MARK_START_ANGLE + disc.theta,
      fillOpacity: 0.2,
      rimWidth: 2,
      opacity: op,
      style: bar,
    });

    // ---- 질량 중심의 자취 — 옮긴 축에만 있다 ----
    if (disc.id === 'shifted' && r.d > 1e-6) {
      g.push({
        type: 'trajectory',
        id: 'cm-circle',
        points: arc(disc.axis, r.d, 0, 2 * Math.PI),
        closed: true,
        width: 1.5,
        opacity: op * 0.75,
        style: { ...accent, lineStyle: 'dashed' },
      });
      g.push({
        type: 'trajectory',
        id: 'cm-path',
        points: arc(disc.axis, r.d, OFFSET_START_ANGLE, OFFSET_START_ANGLE + disc.theta),
        width: 3,
        opacity: op,
        style: accent,
      });
    }

    // ---- 원판 ----
    // 속을 비운다 — 아래 부채꼴과 질량 중심의 자취가 비쳐야 한다.
    g.push({
      type: 'body',
      id: `${disc.id}-disc`,
      pos: disc.cm,
      shape: 'circle',
      size: R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: op,
      style: ink,
    });
    // 표시선 — 원판에 새긴 반지름 하나. 강체라 옮긴 축의 원판도 같은 각만큼 돈다.
    g.push({
      type: 'trajectory',
      id: `${disc.id}-mark`,
      points: [disc.cm, add(disc.cm, dir(MARK_START_ANGLE + disc.theta), R)],
      width: 2.5,
      opacity: op,
      style: ink,
    });

    // ---- 축에서 질량 중심까지 — d ----
    if (disc.id === 'shifted' && r.d > 1e-6) {
      g.push({
        type: 'trajectory',
        id: 'arm',
        points: [disc.axis, disc.cm],
        width: 1.5,
        opacity: op,
        style: muted,
      });
      const a = OFFSET_START_ANGLE + disc.theta;
      // 팔의 반시계 쪽 수직으로 띄운다. 화면 y 는 아래가 양이다.
      g.push({
        type: 'readout',
        id: 'arm-label',
        anchor: {
          world: add(disc.axis, dir(a), r.d / 2),
          offset: [-Math.sin(a) * ARM_LABEL_OFFSET, -Math.cos(a) * ARM_LABEL_OFFSET],
        },
        text: text('label.d'),
        chip: false,
        font: 'text',
        italic: true,
        fontSize: 14,
        align: 'center',
        opacity: op,
        style: muted,
      });
    }

    // ---- 질량 중심(속 빈 고리)과 축(채운 점) ----
    g.push({
      type: 'body',
      id: `${disc.id}-cm`,
      pos: disc.cm,
      shape: 'circle',
      size: CM_RING,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'body',
      id: `${disc.id}-axis`,
      pos: disc.axis,
      shape: 'circle',
      size: AXIS_DOT,
      outline: 'background',
      glow: false,
      opacity: op,
      style: ink,
    });

    // ---- 같은 돌림힘 — 두 축에 같은 원호 ----
    const head = add(disc.axis, dir(TORQUE_TO), TORQUE_ARC_RADIUS);
    const tangent = dir(TORQUE_TO + Math.PI / 2);
    const normal = dir(TORQUE_TO);
    g.push({
      type: 'trajectory',
      id: `${disc.id}-torque`,
      points: arc(disc.axis, TORQUE_ARC_RADIUS, TORQUE_FROM, TORQUE_TO),
      width: 1.5,
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'region',
      id: `${disc.id}-torque-head`,
      points: [
        add(head, tangent, HEAD_LEN * 0.7),
        add(add(head, tangent, -HEAD_LEN * 0.3), normal, HEAD_HALF_W),
        add(add(head, tangent, -HEAD_LEN * 0.3), normal, -HEAD_HALF_W),
      ],
      fillOpacity: 1,
      opacity: op,
      style: ink,
    });
    g.push({
      type: 'readout',
      id: `${disc.id}-torque-label`,
      anchor: { world: add(disc.axis, dir(TORQUE_FROM), TORQUE_ARC_RADIUS + TORQUE_LABEL_GAP) },
      text: text('label.torque'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 13,
      align: 'center',
      opacity: op,
      style: ink,
    });

    // ---- 이름 ----
    g.push({
      type: 'readout',
      id: `${disc.id}-name`,
      anchor: { world: [disc.axis[0], NAME_Y] },
      text: text(disc.name),
      chip: false,
      font: 'text',
      fontSize: 13,
      align: 'center',
      opacity: op,
      style: ink,
    });
  }

  // ---- 관성 모멘트 막대 ----
  // 옮긴 축의 막대는 질량 중심 축의 막대와 **같은 칸** 위에 Md² 조각이 얹힌 것이다.
  const k = BAR_FULL / r.iMax;
  const cmTop = BAR_BASE_Y + r.iCenter * k;
  const shiftedTop = BAR_BASE_Y + r.iShifted * k;
  for (const [id, x] of [
    ['center', BAR_CENTER_X],
    ['shifted', BAR_SHIFTED_X],
  ] as const) {
    g.push({
      type: 'region',
      id: `${id}-bar`,
      points: rect(x, BAR_HALF_W, BAR_BASE_Y, cmTop),
      fillOpacity: 0.5,
      opaque: true,
      opacity: op,
      style: bar,
    });
  }
  if (shiftedTop - cmTop > 1e-4) {
    g.push({
      type: 'region',
      id: 'added-bar',
      points: rect(BAR_SHIFTED_X, BAR_HALF_W, cmTop, shiftedTop),
      fill: 'hatch',
      fillOpacity: 0.55,
      opaque: true,
      opacity: op,
      style: accent,
    });
  }
  // 두 막대의 아래 칸이 같은 높이라는 것 — 점선 하나로 잇는다.
  g.push({
    type: 'trajectory',
    id: 'same-level',
    points: [
      [BAR_CENTER_X - BAR_HALF_W - LEVEL_OVERHANG, cmTop],
      [BAR_SHIFTED_X + BAR_HALF_W + LEVEL_OVERHANG, cmTop],
    ],
    width: 1,
    opacity: op * 0.8,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // 칸 이름표 — I_cm 은 왼쪽 막대 왼편, Md² 는 오른쪽 막대 오른편.
  g.push({
    type: 'readout',
    id: 'icm-label',
    anchor: {
      world: [BAR_CENTER_X - BAR_HALF_W, (BAR_BASE_Y + cmTop) / 2],
      offset: [-SIDE_LABEL_GAP, 0],
    },
    text: text('label.icm'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: 13,
    align: 'right',
    opacity: op,
    style: muted,
  });
  if (shiftedTop - cmTop >= SEGMENT_LABEL_MIN) {
    g.push({
      type: 'readout',
      id: 'md2-label',
      anchor: {
        world: [BAR_SHIFTED_X + BAR_HALF_W, (cmTop + shiftedTop) / 2],
        offset: [SIDE_LABEL_GAP, 0],
      },
      text: text('label.md2'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: 13,
      align: 'left',
      opacity: op,
      style: accent,
    });
  }
  for (const [id, x, name] of [
    ['center', BAR_CENTER_X, 'label.centerAxis'],
    ['shifted', BAR_SHIFTED_X, 'label.shiftedAxis'],
  ] as const) {
    g.push({
      type: 'readout',
      id: `${id}-bar-name`,
      anchor: { world: [x, BAR_BASE_Y], offset: BASE_LABEL_OFFSET },
      text: text(name),
      chip: false,
      font: 'text',
      fontSize: 13,
      align: 'center',
      opacity: op,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
