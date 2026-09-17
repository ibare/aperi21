// ========================================================================
// atwood-machine — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 애트우드 기계 하나를 선언하는 함수를 차이만 달리해 두 번 부른다. 바닥 · 출발 높이 ·
// 줄 · 도르래는 trajectory, 추는 body, 질량과 이름표는 readout, 0.1 초 자취는 trace.
// 자유 렌더는 쓰지 않는다.
// ========================================================================

import type {
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { accel, fallen, landTime, masses, side, snapDiff } from './physics';
import {
  CEILING_Y,
  DIFF_LEFT,
  DROP,
  FLOOR_INSET_PX,
  MACHINE_X,
  PPM,
  PULLEY_R,
  PULLEY_Y,
  SCENE_BOUNDS,
  START_LINE_LEFT,
  START_LINE_RIGHT,
  STROBE,
  TRAIL_OFFSET,
  WIDTH_PX,
  text,
} from './schema';
import type { AtwoodMachineState } from './state';

/** 도르래 · 매단 줄 굵기(화면 px). 원본 2. */
const PULLEY_WIDTH_PX = 2;
/** 추를 매단 줄 굵기(화면 px). 원본 1.5. */
const ROPE_WIDTH_PX = 1.5;
/** 바닥선 굵기(화면 px). 원본 1.5. */
const FLOOR_WIDTH_PX = 1.5;
/** 출발 높이 점선 굵기(화면 px)와 불투명도. 원본 1 · 0.5. */
const START_LINE_WIDTH_PX = 1;
const START_LINE_OPACITY = 0.5;
/** 자취 점 반지름(화면 px)과 불투명도. 원본 3 · 0.45. */
const TRAIL_DOT_PX = 3;
const TRAIL_OPACITY = 0.45;
/** 도르래 원을 잇는 꼭짓점 수. */
const CIRCLE_SEGMENTS = 64;
/** 이름표 글자 크기와 바닥 아래 거리(화면 px). 원본 13 px, 윗변이 바닥 12 px 아래. */
const DIFF_LABEL_FONT_PX = 13;
const DIFF_LABEL_OFFSET_PX = 12 + DIFF_LABEL_FONT_PX / 2;
/** 추 안 질량 글자 크기(화면 px). 원본 11. */
const MASS_FONT_PX = 11;

function line(id: string, points: readonly Vec2[], width: number, extra: Partial<Trajectory> = {}): Trajectory {
  return {
    type: 'trajectory',
    id,
    points,
    width,
    style: { colorRole: 'muted', emphasis: 'strong' },
    ...extra,
  };
}

function circle(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    pts.push([center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r]);
  }
  return pts;
}

/** 기계 한 대. `tag` 는 인스턴스 id 의 접미사다. */
function machine(tag: string, cx: number, diff: number, tau: number): {
  under: Primitive[];
  trail: Primitive;
  over: Primitive[];
} {
  const m = masses(diff);
  const a = accel(diff);
  const tLand = landTime(a);
  const fall = fallen(a, tau);
  const sHeavy = side(m.heavy);
  const sLight = side(m.light);
  const heavyX = cx - PULLEY_R;
  const lightX = cx + PULLEY_R;
  const heavyBottom = DROP - fall;
  const lightBottom = fall;

  const under: Primitive[] = [];

  // 이름표 — 두 기계가 무엇이 다른지.
  under.push({
    type: 'readout',
    id: `diff-${tag}`,
    anchor: { world: [cx, 0], offset: [0, DIFF_LABEL_OFFSET_PX] },
    text: text('label.diff'),
    vars: { d: diff.toFixed(1) },
    chip: false,
    font: 'text',
    fontSize: DIFF_LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 출발 높이 — 무거운 추 중심이 출발한 높이의 짧은 점선.
  const startY = DROP + sHeavy / 2;
  under.push(
    line(
      `start-${tag}`,
      [
        [heavyX - TRAIL_OFFSET - START_LINE_LEFT, startY],
        [heavyX + START_LINE_RIGHT, startY],
      ],
      START_LINE_WIDTH_PX,
      {
        opacity: START_LINE_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      },
    ),
  );

  // 0.1 초마다 무거운 추 중심이 있던 자리. 늙지 않는다 — 간격이 곧 속력이다.
  const until = a > 0 ? Math.min(tau, tLand) : 0;
  const marks: { pos: Vec2 }[] = [];
  for (let k = 0; k * STROBE <= until + 1e-9; k++) {
    marks.push({ pos: [heavyX - TRAIL_OFFSET, DROP - fallen(a, k * STROBE) + sHeavy / 2] });
  }
  const trail: Primitive = {
    type: 'trace',
    id: `trail-${tag}`,
    marks,
    shape: 'dot',
    size: TRAIL_DOT_PX,
    opacity: TRAIL_OPACITY,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  };

  const over: Primitive[] = [];

  // 줄 — 도르래 양 옆에서 추 윗변까지.
  over.push(line(`rope-heavy-${tag}`, [[heavyX, PULLEY_Y], [heavyX, heavyBottom + sHeavy]], ROPE_WIDTH_PX));
  over.push(line(`rope-light-${tag}`, [[lightX, PULLEY_Y], [lightX, lightBottom + sLight]], ROPE_WIDTH_PX));

  // 도르래 — 천장에서 매단 줄, 원, 줄이 움직인 만큼 도는 바큇살, 축.
  over.push(line(`hanger-${tag}`, [[cx, CEILING_Y], [cx, PULLEY_Y + PULLEY_R]], PULLEY_WIDTH_PX));
  over.push(line(`pulley-${tag}`, circle([cx, PULLEY_Y], PULLEY_R), PULLEY_WIDTH_PX, { closed: true }));
  // 원본 화면각 −(d·PPM)/R (무거운 쪽이 왼쪽이라 반시계). 월드는 y 가 위라 부호가 뒤집힌다.
  const turn = fall / PULLEY_R;
  over.push(
    line(
      `spoke-${tag}`,
      [
        [cx, PULLEY_Y],
        [cx + Math.cos(turn) * PULLEY_R, PULLEY_Y + Math.sin(turn) * PULLEY_R],
      ],
      PULLEY_WIDTH_PX,
    ),
  );
  over.push({
    type: 'body',
    id: `hub-${tag}`,
    pos: [cx, PULLEY_Y],
    shape: 'point',
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 추 — 무거운 쪽은 두 기계 모두 파랑, 가벼운 쪽은 두 기계 모두 회색. 색으로 설명하지 않는다.
  over.push({
    type: 'body',
    id: `heavy-${tag}`,
    pos: [heavyX, heavyBottom + sHeavy / 2],
    shape: 'rect',
    size: [sHeavy, sHeavy],
    outline: 'none',
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  over.push({
    type: 'readout',
    id: `heavy-mass-${tag}`,
    anchor: { world: [heavyX, heavyBottom + sHeavy / 2] },
    text: text('label.mass'),
    vars: { m: m.heavy.toFixed(2) },
    chip: false,
    font: 'text',
    fontSize: MASS_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  over.push({
    type: 'body',
    id: `light-${tag}`,
    pos: [lightX, lightBottom + sLight / 2],
    shape: 'rect',
    size: [sLight, sLight],
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });
  over.push({
    type: 'readout',
    id: `light-mass-${tag}`,
    anchor: { world: [lightX, lightBottom + sLight / 2] },
    text: text('label.mass'),
    vars: { m: m.light.toFixed(2) },
    chip: false,
    font: 'text',
    fontSize: MASS_FONT_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  return { under, trail, over };
}

export function scene(params: {
  state: AtwoodMachineState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('atwood-machine: schema.timeline 이 선언되어야 한다');
  // 두 기계가 한 시계를 쓴다. 조절기를 바꾸면 러너가 시계를 0 으로 되돌린다(restart).
  const tau = timeline.u;
  const left = machine('left', MACHINE_X[0], DIFF_LEFT, tau);
  const right = machine('right', MACHINE_X[1], snapDiff(state.diff), tau);

  const out: Primitive[] = [];
  out.push(
    line(
      'floor',
      [
        [FLOOR_INSET_PX / PPM, 0],
        [(WIDTH_PX - FLOOR_INSET_PX) / PPM, 0],
      ],
      FLOOR_WIDTH_PX,
    ),
  );
  // 원본 겹침 순서 — 이름표 · 점선 · 자취 · 줄 · 도르래 · 추 (기계끼리 같은 층을 함께).
  out.push(left.under[0]!, right.under[0]!, left.under[1]!, right.under[1]!);
  out.push(left.trail, right.trail);
  out.push(...left.over, ...right.over);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
