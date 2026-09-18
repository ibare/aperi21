// ========================================================================
// nonlinear-oscillation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 천장(surface + region) ·
// 용수철(constraint) · 추와 펜(body) · 시간축 · 이음선 · 점선 기준 · 기록(trajectory) ·
// 힘 화살표(vector) · 축 기호(readout)가 모두 표준 어휘로 있다.
//
// 뜻과 모양을 하나씩 묶는다 — **점선은 언제나 「힘이 비례했다면」** (기록지의 기준 사인과
// 추 옆의 비례 힘 화살표), 실선은 실제로 일어난 것. 추 · 펜 · 기록은 먹색(추가 곧 기록을
// 그린 것이라 같은 대상), **강조색은 「실제로 되미는 힘」 한 가지 뜻에만.** 천장 · 시간축 ·
// 이음선 · 점선은 배경 정보라 muted. 두 레인이 같은 색이다 — 다른 것은 진폭뿐이다.
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
  linearDisplacementAt,
  massDisplacement,
  displacementAt,
  proportionalForce,
  readConstants,
  readPen,
  recordOpacity,
  released,
  restoringForce,
  solveOrbit,
  type NonlinearOscillationConstants,
  type Orbit,
} from './physics';
import {
  AXIS_END,
  CEILING_DEPTH,
  CEILING_GAP,
  CEILING_HALF,
  FORCE_GAP,
  FORCE_SCALE,
  GHOST_GAP,
  LANE_LARGE_Y,
  LANE_SMALL_Y,
  MASS_SIZE,
  MASS_X,
  PAPER_LENGTH,
  PAPER_START,
  SCENE_BOUNDS,
  SPRING_COILS,
  text,
} from './schema';
import type { NonlinearOscillationState } from './state';

/** 기록 · 점선 표본 수(기록지 전체). 아래 레인 세 주기 남짓의 뾰족한 봉우리가 꺾여 보이지 않을 만큼. */
const CURVE_SAMPLES = 480;
/** 기록 굵기(화면 px). 이 그림의 주인공이라 기본보다 조금 굵다. */
const RECORD_WIDTH = 2.5;
/** 점선 기준 굵기 · 짙기. 기록 아래에서 비쳐야 하되 기록보다 앞으로 나오면 안 된다. */
const REFERENCE_WIDTH = 1.5;
const REFERENCE_OPACITY = 0.85;
/** 안내선(시간축 · 이음선) 굵기(화면 px). 재는 선이지 그림이 아니라 가장 가늘게. */
const GUIDE_WIDTH = 1;
/** 시간축 짙기. 기록 · 점선보다 뒤로 물러나 있어야 한다. */
const AXIS_OPACITY = 0.55;
/** 펜 점 반지름(m). */
const PEN_SIZE = 0.06;
/** 시간축 기호를 축 끝에서 띄우는 거리(화면 px). */
const AXIS_LABEL_OFFSET: Vec2 = [10, 0];
/** 천장 빗금 띠의 짙기. */
const CEILING_FILL = 0.35;
/**
 * 이 길이(m)보다 짧은 힘 화살표는 긋지 않는다. 평형점 근처에서는 힘이 0 에 가깝고, 촉만 남은
 * 꼬투리가 추 옆에 점처럼 찍혀 잡음이 된다 (G02). 같은 배율에서 위 레인의 힘은 끝에서도 이보다
 * 짧아 위 레인에는 화살표가 뜨지 않는다 — 「작게 흔들면 힘도 작고 비례와 같다」 는 기록이 말한다.
 */
const MIN_ARROW = 0.08;
/** 비례 힘 화살표 굵기(화면 px). 실제 힘보다 한 단 가볍다. */
const GHOST_ARROW_WIDTH = 1.5;

/** 한 레인의 선언 — 평형선 높이와 진폭. 두 레인은 같은 용수철 · 같은 추다. */
interface Lane {
  id: string;
  y0: number;
  amplitude: number;
}

export function scene(params: {
  state: NonlinearOscillationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('nonlinear-oscillation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const pen = readPen(timeline);
  const recordAlpha = recordOpacity(timeline);
  const out: Primitive[] = [];

  const lanes: Lane[] = [
    { id: 'small', y0: LANE_SMALL_Y, amplitude: c.amplitudeSmall },
    { id: 'large', y0: LANE_LARGE_Y, amplitude: c.amplitudeLarge },
  ];

  // 쓰기 구간의 시각 s(주기 안) → 기록지 x. 가로 거리가 곧 시간이고, 두 레인이 같은 시간축이다.
  const span = pen.to - pen.from;
  const xOf = (s: number): number => PAPER_START + (PAPER_LENGTH * (s - pen.from)) / span;
  const nowS = pen.from + pen.progress * span;

  for (const lane of lanes) {
    pushLane(out, lane, solveOrbit(lane.amplitude, c), c, timeline, {
      xOf,
      from: pen.from,
      span,
      nowS,
      progress: pen.progress,
      writing: pen.writing,
      recordAlpha,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

interface PenFrame {
  xOf: (s: number) => number;
  from: number;
  span: number;
  nowS: number;
  progress: number;
  writing: boolean;
  recordAlpha: number;
}

function pushLane(
  out: Primitive[],
  lane: Lane,
  orbit: Orbit,
  c: NonlinearOscillationConstants,
  tl: TimelineFrame,
  pen: PenFrame,
): void {
  const { y0, amplitude, id } = lane;
  const half = MASS_SIZE[1] / 2;
  // 천장은 두 레인 모두 평형선에서 **같은 높이**다 — 같은 용수철에 같은 추를 달았으니 평형
  // 길이가 같아야 한다. 높이는 큰 진폭의 추가 가장 올라가도 천장에 닿지 않을 만큼이다.
  const ceilingY = y0 + c.amplitudeLarge + half + CEILING_GAP;

  // ---- 천장 ----
  out.push({
    type: 'region',
    id: `ceiling-hatch-${id}`,
    points: [
      [MASS_X - CEILING_HALF, ceilingY],
      [MASS_X + CEILING_HALF, ceilingY],
      [MASS_X + CEILING_HALF, ceilingY + CEILING_DEPTH],
      [MASS_X - CEILING_HALF, ceilingY + CEILING_DEPTH],
    ],
    fill: 'hatch',
    fillOpacity: CEILING_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'surface',
    id: `ceiling-${id}`,
    geometry: { kind: 'wall', from: [MASS_X - CEILING_HALF, ceilingY], to: [MASS_X + CEILING_HALF, ceilingY] },
    material: 'solid',
  });

  // ---- 시간축 = 평형선 ----
  // 추가 오르내리는 한가운데와 기록의 축이 **같은 선**이다. 점선이 이미 「비례했다면」 을
  // 뜻하므로 축은 가는 실선으로 긋는다.
  out.push({
    type: 'trajectory',
    id: `axis-${id}`,
    points: [
      [MASS_X - MASS_SIZE[0], y0],
      [AXIS_END, y0],
    ],
    width: GUIDE_WIDTH,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: `axis-label-${id}`,
    anchor: { world: [AXIS_END, y0], offset: AXIS_LABEL_OFFSET },
    text: text('label.time'),
    chip: false,
    font: 'text',
    italic: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 점선 기준 — 힘이 비례했다면 ----
  // 기록지 전체에 **미리** 깔려 있다. 펜이 오기 전부터 「여기로 가야 했다」 가 보여야, 기록이
  // 그 위를 따라가는지 앞질러 가는지가 적히는 순간 읽힌다. 기록과 함께 흐려진다.
  const reference: Vec2[] = [];
  for (let k = 0; k <= CURVE_SAMPLES; k++) {
    const s = pen.from + (k * pen.span) / CURVE_SAMPLES;
    reference.push([pen.xOf(s), y0 + linearDisplacementAt(s - pen.from, amplitude, c)]);
  }
  out.push({
    type: 'trajectory',
    id: `reference-${id}`,
    points: reference,
    width: REFERENCE_WIDTH,
    opacity: REFERENCE_OPACITY * pen.recordAlpha,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });

  // ---- 적힌 기록 ----
  const record: Vec2[] = [];
  const n = Math.ceil(CURVE_SAMPLES * pen.progress);
  for (let k = 0; k <= n; k++) {
    const s = Math.min(pen.from + (k * pen.span) / CURVE_SAMPLES, pen.nowS);
    record.push([pen.xOf(s), y0 + displacementAt(orbit, s - pen.from)]);
  }
  if (record.length >= 2) {
    out.push({
      type: 'trajectory',
      id: `record-${id}`,
      points: record,
      width: RECORD_WIDTH,
      opacity: pen.recordAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 추 ----
  const dy = massDisplacement(tl, orbit);
  const y = y0 + dy;

  // 추와 펜을 잇는 이음선. 펜이 적는 높이가 추의 높이라는 것을 가로로 보여 준다.
  if (pen.writing) {
    out.push({
      type: 'trajectory',
      id: `link-${id}`,
      points: [
        [MASS_X + MASS_SIZE[0] / 2, y],
        [pen.xOf(pen.nowS), y],
      ],
      width: GUIDE_WIDTH,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
  }

  out.push({
    type: 'constraint',
    id: `spring-${id}`,
    subtype: 'spring',
    from: [MASS_X, ceilingY],
    to: [MASS_X, y + half],
    coils: SPRING_COILS,
    style: { colorRole: 'secondary', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: `mass-${id}`,
    pos: [MASS_X, y],
    shape: 'rect',
    size: MASS_SIZE,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 되미는 힘 — 실제(강조색 실선)와 비례했다면(muted 점선) ----
  // 둘 다 추 **왼쪽 옆** 에서 추의 높이로 출발하고 같은 배율이다. 위 레인에서는 둘이 거의 같고,
  // 아래 레인에서는 크게 늘어난 끝에서 실제 힘이 점선의 네 배를 넘는다 — 그 차이가 기록의
  // 뾰족한 봉우리와 짧아진 주기를 만든다. 다시 당겨 놓는 동안(`fade`)은 손이 붙잡고 있어
  // 긋지 않는다.
  if (tl.at('fade') === 0) {
    const force = restoringForce(dy, c) * FORCE_SCALE;
    const ghost = proportionalForce(dy, c) * FORCE_SCALE;
    const forceX = MASS_X - MASS_SIZE[0] / 2 - FORCE_GAP;
    if (Math.abs(ghost) >= MIN_ARROW) {
      out.push({
        type: 'vector',
        id: `force-proportional-${id}`,
        from: [forceX - GHOST_GAP, y],
        delta: [0, ghost],
        width: GHOST_ARROW_WIDTH,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
    if (Math.abs(force) >= MIN_ARROW) {
      out.push({
        type: 'vector',
        id: `force-${id}`,
        from: [forceX, y],
        delta: [0, force],
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  // 펜. 기록 끝 위에 올라온다.
  if (pen.writing) {
    out.push({
      type: 'body',
      id: `pen-${id}`,
      pos: [pen.xOf(pen.nowS), y0 + displacementAt(orbit, released(tl))],
      shape: 'circle',
      size: PEN_SIZE,
      glow: false,
      outline: 'background',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
