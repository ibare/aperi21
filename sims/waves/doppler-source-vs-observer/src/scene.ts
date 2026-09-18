// ========================================================================
// doppler-source-vs-observer — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 칸 둘이 같은 선언 틀을 쓴다. 다른 것은 **누가 움직이느냐** 하나이고, 그것을
// 가르는 표지는 색 하나다 — 강조색은 「움직이는 쪽」 한 뜻에만 쓴다(위 칸은 음원,
// 아래 칸은 관찰자). 파면 · 눈금 · 치수선은 두 칸이 같은 색이다.
//
// 파면은 `trace` ring 이 아니라 `trajectory` 닫힌 원으로 긋는다. ring 의 반지름은
// 화면 px 라 배율이 바뀌면 파면 간격과 음원 · 관찰자 사이 거리의 비가 깨지는데,
// 이 조각의 주장이 바로 그 간격이다 (이웃 `doppler-effect` NOTES 「어휘 부족」 1).
// 칸 밖으로 넘치는 원은 `clip` 으로 칸 사각형 안에만 그린다.
// ========================================================================

import type {
  Body,
  Dimension,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import { derive, readConstants, type LaneReading } from './physics';
import {
  ARROW_LEN,
  ARROW_RISE,
  BOTTOM_AXIS_Y,
  CIRCLE_SEGMENTS,
  CURSOR_OPACITY,
  DIM_RISE,
  FREQ_DROP,
  FRONT_OPACITY,
  FRONT_WIDTH_PX,
  LABEL_GAP_PX,
  LABEL_PX,
  LANE_FILL_OPACITY,
  LANE_HALF_H,
  LANE_X0,
  LANE_X1,
  MEET_LIFE,
  MEET_RING_PX,
  MEET_SPREAD_PX,
  MEET_WIDTH_PX,
  OBSERVER_PATH,
  SCENE_BOUNDS,
  SOURCE_PATH,
  STRIP_DROP,
  STRIP_LABEL_X,
  STRIP_WIDTH_PX,
  STRIP_X0,
  STRIP_X1,
  TICK_LEN,
  TICK_WIDTH_PX,
  TITLE_PX,
  TITLE_RISE,
  TOP_AXIS_Y,
  WINDOW_CAP_LEN,
  text,
} from './schema';
import type { DopplerSourceVsObserverState } from './state';

/** 축 위 한 점을 중심으로 한 원의 표본. */
function circle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: DopplerSourceVsObserverState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('doppler-source-vs-observer: schema.timeline 이 선언되어야 한다');

  const c = readConstants(stage);
  const r = derive(timeline, c);
  const alpha = r.opacity;
  const out: Primitive[] = [];

  const lane = (id: string, reading: LaneReading, axisY: number): void => {
    const y0 = axisY - LANE_HALF_H;
    const y1 = axisY + LANE_HALF_H;
    const clip = { min: [LANE_X0, y0] as Vec2, max: [LANE_X1, y1] as Vec2 };
    const sourceMoves = reading.mover === 'source';

    // ---- 칸 바탕 ---- 파면이 어디까지 그려지는지만 가른다.
    const bg: Region = {
      type: 'region',
      id: `${id}-lane`,
      points: [
        [LANE_X0, y0],
        [LANE_X1, y0],
        [LANE_X1, y1],
        [LANE_X0, y1],
      ],
      fillOpacity: LANE_FILL_OPACITY,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(bg);

    // ---- 칸 제목 ---- 두 칸을 가르는 것은 이 이름이다.
    const title: Readout = {
      type: 'readout',
      id: `${id}-title`,
      anchor: { world: [LANE_X0, y1 + TITLE_RISE] },
      text: text(sourceMoves ? 'label.sourceMoves' : 'label.observerMoves'),
      chip: false,
      align: 'left',
      font: 'text',
      weight: 'bold',
      fontSize: TITLE_PX,
      opacity: alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(title);

    // ---- 파면 ---- 나온 자리를 중심으로 제 빠르기로 퍼지는 원.
    reading.fronts.forEach((f, i) => {
      if (f.r <= 0 || f.opacity <= 0) return;
      const front: Trajectory = {
        type: 'trajectory',
        id: `${id}-front-${i}`,
        points: circle(f.cx, axisY, f.r),
        closed: true,
        width: FRONT_WIDTH_PX,
        opacity: FRONT_OPACITY * f.opacity * alpha,
        clip,
        style: { colorRole: 'ink', emphasis: 'medium' },
      };
      out.push(front);
    });

    // ---- 치수선 ---- 멈춰 세운 장면에서 관찰자 앞 이웃 두 파면의 간격.
    if (reading.gap) {
      const dim: Dimension = {
        type: 'dimension',
        id: `${id}-gap`,
        from: [reading.gap[0], axisY + DIM_RISE],
        to: [reading.gap[1], axisY + DIM_RISE],
        text: text(sourceMoves ? 'label.lambdaShort' : 'label.lambda'),
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      };
      out.push(dim);
    }

    // ---- 음원 · 관찰자 ---- 강조색은 움직이는 쪽 하나.
    const source: Body = {
      type: 'body',
      id: `${id}-source`,
      pos: [reading.sourceX, axisY],
      shape: 'custom',
      customPath: SOURCE_PATH,
      opacity: alpha,
      style: { colorRole: sourceMoves ? 'accent' : 'ink', emphasis: 'strong' },
    };
    const observer: Body = {
      type: 'body',
      id: `${id}-observer`,
      pos: [reading.observerX, axisY],
      shape: 'custom',
      customPath: OBSERVER_PATH,
      opacity: alpha,
      style: { colorRole: sourceMoves ? 'ink' : 'accent', emphasis: 'strong' },
    };
    out.push(source, observer);

    const freq: Readout = {
      type: 'readout',
      id: `${id}-freq`,
      anchor: { world: [reading.sourceX, axisY - FREQ_DROP] },
      text: text('label.freq'),
      vars: { f: String(c.sourceFreq) },
      fontSize: LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(freq);

    // ---- 만남 ---- 파면의 앞 끝이 관찰자에 닿는 순간 번지는 고리.
    if (reading.meetAges.length > 0) {
      const meet: Trace = {
        type: 'trace',
        id: `${id}-meet`,
        marks: reading.meetAges.map((age) => ({ pos: [reading.observerX, axisY] as Vec2, age })),
        life: MEET_LIFE,
        shape: 'ring',
        size: MEET_RING_PX,
        spreadTo: MEET_SPREAD_PX,
        width: MEET_WIDTH_PX,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      };
      out.push(meet);
    }

    // ---- 속도 화살표 ---- 두 칸이 같은 길이 · 같은 글자 — 같은 빠르기다.
    if (reading.moving) {
      const x = sourceMoves ? reading.sourceX : reading.observerX;
      const dir = sourceMoves ? 1 : -1;
      const arrow: Vector = {
        type: 'vector',
        id: `${id}-velocity`,
        from: [x, axisY + ARROW_RISE],
        delta: [dir * ARROW_LEN, 0],
        opacity: alpha,
        style: { colorRole: 'accent', emphasis: 'strong' },
      };
      const speed: Readout = {
        type: 'readout',
        id: `${id}-speed`,
        anchor: { world: [x + (dir * ARROW_LEN) / 2, axisY + ARROW_RISE], offset: [0, -LABEL_GAP_PX] },
        text: text('label.speed'),
        vars: { u: String(c.moverSpeed) },
        fontSize: LABEL_PX,
        opacity: alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      out.push(arrow, speed);
    }

    // ---- 눈금줄 ---- 같은 시간창에 관찰자가 만난 파면 하나가 눈금 하나.
    const sy = y0 - STRIP_DROP;
    const base: Trajectory = {
      type: 'trajectory',
      id: `${id}-strip`,
      points: [
        [STRIP_X0, sy],
        [STRIP_X1, sy],
      ],
      width: STRIP_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    const caps: Trace = {
      type: 'trace',
      id: `${id}-strip-caps`,
      marks: [{ pos: [STRIP_X0, sy] }, { pos: [STRIP_X1, sy] }],
      shape: 'tick',
      size: WINDOW_CAP_LEN,
      width: STRIP_WIDTH_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    const label: Readout = {
      type: 'readout',
      id: `${id}-strip-label`,
      anchor: { world: [STRIP_LABEL_X, sy] },
      text: text('label.met'),
      chip: false,
      align: 'left',
      font: 'text',
      fontSize: LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    };
    out.push(base, caps, label);

    if (reading.ticks.length > 0) {
      const ticks: Trace = {
        type: 'trace',
        id: `${id}-ticks`,
        marks: reading.ticks.map((x) => ({ pos: [x, sy] as Vec2 })),
        shape: 'tick',
        size: TICK_LEN,
        width: TICK_WIDTH_PX,
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      };
      out.push(ticks);
    }
    if (reading.cursorX !== null) {
      const cursor: Trace = {
        type: 'trace',
        id: `${id}-cursor`,
        marks: [{ pos: [reading.cursorX, sy] }],
        shape: 'tick',
        size: TICK_LEN,
        width: STRIP_WIDTH_PX,
        opacity: CURSOR_OPACITY * alpha,
        style: { colorRole: 'muted', emphasis: 'strong' },
      };
      out.push(cursor);
    }
  };

  lane('top', r.top, TOP_AXIS_Y);
  lane('bottom', r.bottom, BOTTOM_AXIS_Y);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같은 값이다 (원칙 6 · S-piece). */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
