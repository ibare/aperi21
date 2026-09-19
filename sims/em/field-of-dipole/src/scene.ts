// ========================================================================
// field-of-dipole — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 왼쪽 판 — 쌍극자의 전기력선.
// - 사이 선 · 바깥 선 → `lineSet` 둘. 같은 대상(전기장)이라 같은 색이고, 지금 보는 쪽만
//   짙다. 짙기는 시간표 진행도에서 나온다.
// - +q · −q → 같은 색 `body` 원 + 부호 표식 `readout`(장부 G177). 부호는 색이 아니라 표식으로 가른다.
//
// 오른쪽 판 — 축을 따라 멀어질 때의 세기.
// - 축 · 눈금 → `lineSet`(muted), 눈금 표식 `r` · `2r` · `3r` → `readout`.
// - 두 곡선 → `trajectory` 둘. 같은 색, **선 모양으로 가른다** — 전하 하나는 실선, 쌍극자는 점선.
//   탐침이 지나간 만큼만 자란다.
// - 탐침 점 둘 → `body`. **강조색은 「지금 재는 자리」 한 뜻에만** 쓴다.
// - 곡선 이름표 → 탐침 점 옆에 붙는 `readout`. 따로 모은 범례 상자는 두지 않는다 (S-piece).
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { chargePositions, readConstants, strengthAt } from './physics';
import { FIELD_CLIP, GRAPH, GRAPH_AXIS_TOP, SCENE_BOUNDS, text } from './schema';
import type { FieldOfDipoleState } from './state';

/** 전기력선 굵기(화면 px). */
const FIELD_LINE_PX = 1.4;
/** 지금 보지 않는 쪽 선의 불투명도 — 모양은 남되 뒤로 물러난다. */
const DIM_OPACITY = 0.18;
/** 전하 원 반지름(월드). */
const CHARGE_RADIUS = 0.2;
/** 부호 표식 글자 크기(화면 px). 공 안에 들어가는 크기다. */
const SIGN_PX = 15;
/** 축 굵기(화면 px) · 눈금 길이(월드). */
const AXIS_PX = 1.2;
const TICK_LEN = 0.09;
/** 눈금 표식 · 축 이름 글자 크기(화면 px)와 축에서 띄우는 거리(화면 px). */
const TICK_LABEL_PX = 12;
const TICK_LABEL_DROP_PX = 13;
const AXIS_LABEL_PX = 12;
const AXIS_LABEL_GAP_PX = 8;
const DISTANCE_LABEL_DROP_PX = 30;
/** 세기 곡선 굵기(화면 px). */
const CURVE_PX = 2.2;
/** 탐침 점 반지름(월드). */
const PROBE_RADIUS = 0.075;
/** 탐침에서 축까지 내리는 안내선 굵기(화면 px)와 불투명도. */
const PROBE_GUIDE_PX = 1;
const PROBE_GUIDE_OPACITY = 0.7;
/** 곡선 이름표 글자 크기(화면 px), 탐침 점 오른쪽으로 띄움 · 위아래로 벌림(화면 px). */
const CURVE_LABEL_PX = 12;
const CURVE_LABEL_GAP_PX = 12;
const CURVE_LABEL_RISE_PX = 10;
/** 이보다 옅으면 선언하지 않는다. */
const MIN_OPACITY = 0.01;

const LINE_CLIP = { min: FIELD_CLIP.min, max: FIELD_CLIP.max };

export function scene(params: {
  state: FieldOfDipoleState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('field-of-dipole: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tl = timeline;

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ball = { colorRole: 'muted', emphasis: 'subtle' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const out: Primitive[] = [];

  // ---- 짙기 — 모두 시간표 진행도의 조합이다 ----
  // 사이 선: between 에서 짙고, 바깥을 보는 동안 물러났다가, align 부터 다시 짙다.
  const innerOpacity = 1 - (1 - DIM_OPACITY) * (tl.at('toOutside') - tl.at('align'));
  // 바깥 선: between 에서 물러나 있다가 toOutside 부터 짙고, reset 에서 다시 물러난다.
  const outerOpacity = DIM_OPACITY + (1 - DIM_OPACITY) * (tl.at('toOutside') - tl.at('reset'));
  // 견주기: align 에서 나타나고 reset 에서 사라진다.
  const graphOpacity = tl.at('align') - tl.at('reset');

  // ---- 전기력선 ----
  // 전하 원 안의 점은 뺀다 — 선이 원 가장자리에서 나고 들어, 원 안의 부호가 읽힌다.
  const { plus, minus } = chargePositions(c);
  const outsideCharges = (p: Vec2): boolean =>
    Math.hypot(p[0] - plus[0], p[1] - plus[1]) >= CHARGE_RADIUS &&
    Math.hypot(p[0] - minus[0], p[1] - minus[1]) >= CHARGE_RADIUS;
  const pick = (inner: boolean): Vec2[][] =>
    state.lines.filter((l) => l.inner === inner).map((l) => l.points.filter(outsideCharges));
  const outerLines: LineSet = {
    type: 'lineSet',
    id: 'lines-outside',
    lines: pick(false),
    width: FIELD_LINE_PX,
    opacity: outerOpacity,
    clip: LINE_CLIP,
    style: ink,
  };
  const innerLines: LineSet = {
    type: 'lineSet',
    id: 'lines-between',
    lines: pick(true),
    width: FIELD_LINE_PX,
    opacity: innerOpacity,
    clip: LINE_CLIP,
    style: ink,
  };
  out.push(outerLines, innerLines);

  // ---- 축 위 거리 r ----
  // 견주기 판의 가로축이 이 축이라는 것 — 쌍극자 가운데에서 잰 거리 r 자리에 눈금을 둔다.
  // 맞추기(align)부터 견주기와 함께 나타난다.
  const r0 = c.probeStart;
  if (graphOpacity >= MIN_OPACITY) {
    const ray: Trajectory = {
      type: 'trajectory',
      id: 'axis-ray',
      points: [
        [minus[0] + CHARGE_RADIUS, 0],
        [FIELD_CLIP.max[0], 0],
      ],
      width: AXIS_PX,
      opacity: graphOpacity,
      style: { ...muted, lineStyle: 'dotted' },
    };
    const tick: LineSet = {
      type: 'lineSet',
      id: 'axis-ray-tick',
      lines: [
        [
          [r0, -TICK_LEN],
          [r0, TICK_LEN],
        ],
      ],
      width: AXIS_PX,
      opacity: graphOpacity,
      style: muted,
    };
    const tickLabel: Readout = {
      type: 'readout',
      id: 'axis-ray-r',
      anchor: { world: [r0, 0], offset: [0, TICK_LABEL_DROP_PX] },
      text: text('mark.r'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: TICK_LABEL_PX,
      opacity: graphOpacity,
      style: muted,
    };
    out.push(ray, tick, tickLabel);
  }

  // ---- 전하 ----
  for (const [id, pos, sign] of [
    ['plus', plus, 'mark.plus'],
    ['minus', minus, 'mark.minus'],
  ] as const) {
    const charge: Body = {
      type: 'body',
      id: `charge-${id}`,
      pos,
      shape: 'circle',
      size: CHARGE_RADIUS,
      glow: false,
      outline: 'line',
      style: ball,
    };
    const mark: Readout = {
      type: 'readout',
      id: `sign-${id}`,
      anchor: { world: pos },
      text: text(sign),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: SIGN_PX,
      align: 'center',
      style: ink,
    };
    out.push(charge, mark);
  }

  // ---- 견주기 판 ----
  const r1 = r0 * c.probeReach;
  const gx = (r: number): number => GRAPH.x0 + ((r - r0) / (r1 - r0)) * GRAPH.width;
  const gy = (v: number): number => GRAPH.y0 + v * GRAPH.top;
  const xEnd = GRAPH.x0 + GRAPH.width;

  // 축과 눈금 — r 의 정수 배마다.
  const axisLines: Vec2[][] = [
    [
      [GRAPH.x0, GRAPH.y0 + GRAPH_AXIS_TOP],
      [GRAPH.x0, GRAPH.y0],
      [xEnd, GRAPH.y0],
    ],
  ];
  const ticks: { x: number; n: number }[] = [];
  for (let n = 1; n <= c.probeReach; n++) {
    const x = gx(n * r0);
    ticks.push({ x, n });
    axisLines.push([
      [x, GRAPH.y0],
      [x, GRAPH.y0 - TICK_LEN],
    ]);
  }
  const axes: LineSet = {
    type: 'lineSet',
    id: 'graph-axes',
    lines: axisLines,
    width: AXIS_PX,
    style: muted,
  };
  out.push(axes);
  for (const { x, n } of ticks) {
    const label: Readout = {
      type: 'readout',
      id: `tick-${n}`,
      anchor: { world: [x, GRAPH.y0], offset: [0, TICK_LABEL_DROP_PX] },
      text: text(n === 1 ? 'mark.r' : 'mark.nr'),
      ...(n === 1 ? {} : { vars: { n: String(n) } }),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: TICK_LABEL_PX,
      align: 'center',
      style: muted,
    };
    out.push(label);
  }
  const strengthLabel: Readout = {
    type: 'readout',
    id: 'axis-strength',
    anchor: { world: [GRAPH.x0, GRAPH.y0 + GRAPH_AXIS_TOP], offset: [AXIS_LABEL_GAP_PX, 0] },
    text: text('label.strength'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_PX,
    align: 'left',
    style: muted,
  };
  const distanceLabel: Readout = {
    type: 'readout',
    id: 'axis-distance',
    anchor: { world: [GRAPH.x0 + GRAPH.width / 2, GRAPH.y0], offset: [0, DISTANCE_LABEL_DROP_PX] },
    text: text('label.distance'),
    chip: false,
    font: 'text',
    fontSize: AXIS_LABEL_PX,
    align: 'center',
    style: muted,
  };
  out.push(strengthLabel, distanceLabel);

  if (graphOpacity >= MIN_OPACITY) {
    // 탐침이 지금 있는 거리 — walk 동안 r 에서 (배수)·r 까지.
    const r = r0 + (r1 - r0) * tl.at('walk');
    const now = strengthAt(r, c);
    const drawn = state.curve.filter((s) => s.r < r);

    // 두 곡선 — 지나간 만큼만. 같은 색, 선 모양으로 가른다.
    const singlePts: Vec2[] = [...drawn.map((s): Vec2 => [gx(s.r), gy(s.single)]), [gx(r), gy(now.single)]];
    const dipolePts: Vec2[] = [...drawn.map((s): Vec2 => [gx(s.r), gy(s.dipole)]), [gx(r), gy(now.dipole)]];
    if (singlePts.length >= 2) {
      const single: Trajectory = {
        type: 'trajectory',
        id: 'curve-single',
        points: singlePts,
        width: CURVE_PX,
        opacity: graphOpacity,
        style: { ...ink, lineStyle: 'solid' },
      };
      const dipole: Trajectory = {
        type: 'trajectory',
        id: 'curve-dipole',
        points: dipolePts,
        width: CURVE_PX,
        opacity: graphOpacity,
        style: { ...ink, lineStyle: 'dashed' },
      };
      out.push(single, dipole);
    }

    // 탐침에서 축까지 — 두 점이 같은 거리에 있다는 것.
    const px = gx(r);
    const guide: Trajectory = {
      type: 'trajectory',
      id: 'probe-guide',
      points: [
        [px, GRAPH.y0],
        [px, gy(Math.max(now.single, now.dipole))],
      ],
      width: PROBE_GUIDE_PX,
      opacity: graphOpacity * PROBE_GUIDE_OPACITY,
      style: { ...muted, lineStyle: 'dotted' },
    };
    out.push(guide);

    for (const [id, v, label, rise] of [
      ['single', now.single, 'label.single', -CURVE_LABEL_RISE_PX],
      ['dipole', now.dipole, 'label.dipole', CURVE_LABEL_RISE_PX],
    ] as const) {
      const dot: Body = {
        type: 'body',
        id: `probe-${id}`,
        pos: [px, gy(v)],
        shape: 'circle',
        size: PROBE_RADIUS,
        glow: false,
        outline: 'background',
        opacity: graphOpacity,
        style: accent,
      };
      const name: Readout = {
        type: 'readout',
        id: `name-${id}`,
        anchor: { world: [px, gy(v)], offset: [CURVE_LABEL_GAP_PX, rise] },
        text: text(label),
        chip: false,
        font: 'text',
        fontSize: CURVE_LABEL_PX,
        align: 'left',
        opacity: graphOpacity,
        style: ink,
      };
      out.push(dot, name);
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
