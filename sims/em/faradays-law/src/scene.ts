// ========================================================================
// faradays-law — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽: 옆에서 본 코일(고리의 뒤 반쪽 · 앞 반쪽을 `lineSet` 둘로) 사이로 자석
// (`body` rect 둘)이 밀려 들어간다. 오른쪽: 코일에서 도선이 이어진 기록지 —
// 축(`lineSet`)과 판마다의 자취(`trajectory`), 지금 적는 자리(`body` point),
// 봉우리 이름표(`readout`).
//
// 색은 뜻마다 하나다. 자석 · 자취 · 글자는 먹색, 코일과 도선 · 축은 배경 정보라
// muted, 움직임 화살표는 primary. **강조색은 쓰지 않는다** — 세 자취를 색으로
// 가르면 범례가 되고(S-piece), 가르는 것은 선 모양(지난 판은 점선)과 이름표다.
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
  magnetAfter,
  peakOf,
  readConstants,
  recordedSeconds,
  rounds,
  sincePush,
  voltageAfter,
  type FaradaysLawConstants,
  type Round,
} from './physics';
import {
  ARROW_RISE,
  COIL_LENGTH,
  COIL_X,
  COIL_Y,
  GRAPH_H,
  GRAPH_X,
  GRAPH_Y,
  LEAD_Y,
  MAGNET_H,
  MAGNET_W,
  RING_RX,
  RING_RY,
  SCENE_BOUNDS,
  TURNS_LABEL_Y,
  text,
} from './schema';
import type { FaradaysLawState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 자석 N · 자취 · 이름표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 코일 · 도선 · 기록지 축 — 배경 정보. */
const WIRE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 자석의 움직임. */
const MOTION = { colorRole: 'primary', emphasis: 'strong' } as const;

/** 자석 S 극의 빛의 양 — 이웃 `lenz-law` 와 같은 자석이라 같은 값이다. */
const SOUTH_LUMINANCE = 0.33;
/** N 글자 — 짙은 반쪽에서 파낸 글자라 바탕에 가까운 빛의 양이다. */
const KNOCKOUT_LUMINANCE = 0.04;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 반 고리 하나를 이루는 점 개수. */
const HALF_RING_SEGMENTS = 24;
/** 코일선 굵기. */
const COIL_WIDTH_PX = 2.2;
/** 도선 · 축 굵기. */
const LEAD_WIDTH_PX = 1.4;
const AXIS_WIDTH_PX = 1.4;
/** 도선 두 가닥의 높이 차(월드) — 나란히 가도록 벌린다. */
const LEAD_SPLIT = 0.13;
/** 도선 끝이 기록지 축 앞에서 멈추는 거리(월드). */
const LEAD_STOP = 0.14;

/** 자취 굵기 — 지금 판과 지난 판. 굵기는 위계다. */
const TRACE_WIDTH_PX = 2.6;
const PAST_TRACE_WIDTH_PX = 1.8;
/** 지난 판 자취의 짙기. 지금 자취보다 물러나되 다크에서도 읽혀야 한다. */
const PAST_OPACITY = 0.6;
/** 자취 표본 간격(초). 빠른 판의 좁은 봉우리가 모나지 않을 만큼. */
const TRACE_DT = 0.02;

/** 움직임 화살표 굵기(화면 px) · 머리(월드). */
const ARROW_WIDTH_PX = 2.4;
const ARROW_HEAD = 0.14;
/** 화살표 기호가 꼬리에서 비켜서는 거리(월드). */
const ARROW_LABEL_GAP = 0.12;

/** 글자 크기(화면 px) — 극 · 기호 · 축 이름. */
const POLE_FONT_PX = 13;
const LABEL_FONT_PX = 13;
const AXIS_FONT_PX = 12;
/** 봉우리 이름표가 꼭대기 위로 뜨는 거리(화면 px, 위가 음수). */
const PEAK_LABEL_OFFSET: Vec2 = [0, -12];
/** 오른쪽에 붙는 봉우리 이름표의 띄움(화면 px) — 떨어지는 자취선을 비켜선다. */
const PEAK_LABEL_OFFSET_RIGHT: Vec2 = [16, 0];
/** 축 이름이 축 끝에서 비켜서는 거리(화면 px). */
const AXIS_V_OFFSET: Vec2 = [0, -10];
const AXIS_T_OFFSET: Vec2 = [10, 0];

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

/** 이 판의 자석이 화면에 있는 동안인가 — 나타남 단계 시작부터 사라짐 단계 끝까지. */
function onStage(tl: TimelineFrame, r: Round): boolean {
  return tl.u >= tl.start(`${r.id}-in`) && tl.u < tl.end(r.outPhase);
}

/** 이 판의 자취가 지난 판이 되었는가 — 다음 판의 자석이 나타나기 시작하면. */
function isPast(tl: TimelineFrame, all: readonly Round[], i: number): boolean {
  const next = all[i + 1];
  return next !== undefined && tl.u >= tl.start(`${next.id}-in`);
}

/** 감은 수를 늘린 코일이 드러난 정도 0~1. 되감는 동안 커지고, 마지막에 흐려지며 돌아간다. */
function rewound(tl: TimelineFrame): number {
  return tl.at('turns-in') * (1 - tl.at('clear'));
}

// ------------------------------------------------------------------------
// 코일
// ------------------------------------------------------------------------

/** 감은 수만큼의 고리 중심 x. 코일 길이는 같고 촘촘해진다. */
function ringXs(turns: number): number[] {
  const count = Math.max(2, Math.round(turns));
  return Array.from({ length: count }, (_, i) => COIL_X - COIL_LENGTH / 2 + (i * COIL_LENGTH) / (count - 1));
}

/**
 * 고리 반쪽들. 옆에서 비스듬히 본 고리라 **왼쪽 반이 뒤, 오른쪽 반이 앞**이다.
 * 자석을 둘 사이에 선언하면 고리 속을 지나는 것으로 읽힌다.
 */
function halfRings(turns: number, front: boolean): Vec2[][] {
  const from = front ? -Math.PI / 2 : Math.PI / 2;
  return ringXs(turns).map((cx) =>
    Array.from({ length: HALF_RING_SEGMENTS + 1 }, (_, k): Vec2 => {
      const a = from + (k / HALF_RING_SEGMENTS) * Math.PI;
      return [cx + RING_RX * Math.cos(a), COIL_Y + RING_RY * Math.sin(a)];
    }),
  );
}

function coilHalf(id: string, turns: number, front: boolean, opacity: number): Primitive {
  return {
    type: 'lineSet',
    id,
    lines: halfRings(turns, front),
    width: COIL_WIDTH_PX,
    opacity,
    style: WIRE,
  };
}

// ------------------------------------------------------------------------
// 기록지
// ------------------------------------------------------------------------

function graphPoint(tau: number, volt: number, c: FaradaysLawConstants): Vec2 {
  return [GRAPH_X + tau * c.secondsToWorld, GRAPH_Y + volt * c.voltScale];
}

function tracePoints(r: Round, seconds: number, c: FaradaysLawConstants): Vec2[] {
  const count = Math.max(1, Math.ceil(seconds / TRACE_DT));
  return Array.from({ length: count + 1 }, (_, k) => {
    const tau = (k / count) * seconds;
    return graphPoint(tau, voltageAfter(tau, r, c), c);
  });
}

/** 판마다의 봉우리 이름표 — 배수는 스테이지 상수를 그대로 끼운다. */
function peakLabel(r: Round, c: FaradaysLawConstants): Pick<Primitive & { type: 'readout' }, 'text' | 'vars'> {
  if (r.id === 'slow') return { text: text('label.speed') };
  if (r.id === 'fast') return { text: text('label.speedTimes'), vars: { k: String(c.speedRatio) } };
  return {
    text: text('label.speedTurns'),
    vars: { s: String(c.speedRatio), n: String(c.turnsRatio) },
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: FaradaysLawState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('faradays-law: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const all = rounds(c);
  const more = rewound(tl);
  const clearing = 1 - tl.at('clear');
  const out: Primitive[] = [];

  // ---- 도선 — 코일 두 끝에서 기록지로 ----
  const leftEnd = COIL_X - COIL_LENGTH / 2;
  const rightEnd = COIL_X + COIL_LENGTH / 2;
  const bottom = COIL_Y - RING_RY;
  const stopX = GRAPH_X - LEAD_STOP;
  out.push({
    type: 'lineSet',
    id: 'leads',
    lines: [
      [
        [leftEnd, bottom],
        [leftEnd, LEAD_Y],
        [stopX, LEAD_Y],
      ],
      [
        [rightEnd, bottom],
        [rightEnd, LEAD_Y + LEAD_SPLIT],
        [stopX, LEAD_Y + LEAD_SPLIT],
      ],
    ],
    width: LEAD_WIDTH_PX,
    style: WIRE,
  });
  for (const [i, y] of [LEAD_Y, LEAD_Y + LEAD_SPLIT].entries()) {
    out.push({
      type: 'body',
      id: `lead-end-${i}`,
      pos: [stopX, y],
      shape: 'point',
      style: WIRE,
    });
  }

  // ---- 코일 뒤 반쪽 ----
  // 처음 코일과 더 감은 코일을 겹쳐 두고 되감는 동안 서로 바꾼다.
  const moreTurns = c.turns * c.turnsRatio;
  out.push(coilHalf('coil-back', c.turns, false, 1 - more));
  if (more > 0) out.push(coilHalf('coil-more-back', moreTurns, false, more));

  // ---- 자석 ----
  const active = all.find((r) => onStage(tl, r));
  let magnet: { x: number; speed: number; round: Round } | undefined;
  if (active) {
    const m = magnetAfter(sincePush(tl, active), active);
    const alpha = tl.at(`${active.id}-in`) * (1 - tl.at(active.outPhase));
    const x = COIL_X + m.d;
    magnet = { x, speed: m.speed, round: active };
    const half = MAGNET_W / 4;
    // 밀려 들어가는 쪽(오른쪽)이 N 이다.
    out.push({
      type: 'body',
      id: 'magnet-s',
      pos: [x - half, COIL_Y],
      shape: 'rect',
      size: [MAGNET_W / 2, MAGNET_H],
      luminance: SOUTH_LUMINANCE,
      opacity: alpha,
      style: INK,
    });
    out.push({
      type: 'body',
      id: 'magnet-n',
      pos: [x + half, COIL_Y],
      shape: 'rect',
      size: [MAGNET_W / 2, MAGNET_H],
      opacity: alpha,
      style: INK,
    });
    out.push({
      type: 'readout',
      id: 'pole-s',
      anchor: { world: [x - half, COIL_Y] },
      text: text('label.poleS'),
      chip: false,
      align: 'center',
      font: 'text',
      weight: 'bold',
      fontSize: POLE_FONT_PX,
      opacity: alpha,
      style: INK,
    });
    out.push({
      type: 'readout',
      id: 'pole-n',
      anchor: { world: [x + half, COIL_Y] },
      text: text('label.poleN'),
      chip: false,
      align: 'center',
      font: 'text',
      weight: 'bold',
      fontSize: POLE_FONT_PX,
      luminance: KNOCKOUT_LUMINANCE,
      opacity: alpha,
      style: INK,
    });
  }

  // ---- 코일 앞 반쪽 — 자석 위로 지나간다 ----
  out.push(coilHalf('coil-front', c.turns, true, 1 - more));
  if (more > 0) out.push(coilHalf('coil-more-front', moreTurns, true, more));

  // ---- 감은 수 이름표 ----
  out.push({
    type: 'readout',
    id: 'turns-label',
    anchor: { world: [COIL_X, TURNS_LABEL_Y] },
    text: text('label.turns'),
    chip: false,
    align: 'center',
    font: 'text',
    italic: true,
    fontSize: LABEL_FONT_PX,
    opacity: 1 - more,
    style: INK,
  });
  if (more > 0) {
    out.push({
      type: 'readout',
      id: 'turns-more-label',
      anchor: { world: [COIL_X, TURNS_LABEL_Y] },
      text: text('label.turnsTimes'),
      vars: { k: String(c.turnsRatio) },
      chip: false,
      align: 'center',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      opacity: more,
      style: INK,
    });
  }

  // ---- 움직임 화살표 — 움직이는 동안만 ----
  // 길이가 속력에 비례한다. 빠른 판에서 화살표가 두 배로 길어지는 것이 「같은 자석,
  // 다른 빠르기」 를 말한다. 멈추면 화살표가 사라진다 — 향 없는 0 길이를 남기지 않는다.
  if (magnet && magnet.speed > 0) {
    const len = magnet.speed * c.arrowScale;
    const y = COIL_Y + ARROW_RISE;
    const from: Vec2 = [magnet.x - len / 2, y];
    out.push({
      type: 'vector',
      id: 'motion',
      from,
      delta: [len, 0],
      width: ARROW_WIDTH_PX,
      headSize: ARROW_HEAD,
      style: MOTION,
    });
    const slow = magnet.round.id === 'slow';
    out.push({
      type: 'readout',
      id: 'motion-label',
      anchor: { world: [from[0] - ARROW_LABEL_GAP, y] },
      text: slow ? text('label.speed') : text('label.speedTimes'),
      vars: slow ? undefined : { k: String(c.speedRatio) },
      chip: false,
      align: 'right',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      style: MOTION,
    });
  }

  // ---- 기록지 축 ----
  const axisEnd = GRAPH_X + c.graphSeconds * c.secondsToWorld;
  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [GRAPH_X, GRAPH_Y + GRAPH_H],
        [GRAPH_X, GRAPH_Y],
        [axisEnd, GRAPH_Y],
      ],
    ],
    width: AXIS_WIDTH_PX,
    style: WIRE,
  });
  out.push({
    type: 'readout',
    id: 'axis-v',
    anchor: { world: [GRAPH_X, GRAPH_Y + GRAPH_H], offset: AXIS_V_OFFSET },
    text: text('label.axisV'),
    chip: false,
    align: 'center',
    font: 'text',
    italic: true,
    fontSize: AXIS_FONT_PX,
    style: WIRE,
  });
  out.push({
    type: 'readout',
    id: 'axis-t',
    anchor: { world: [axisEnd, GRAPH_Y], offset: AXIS_T_OFFSET },
    text: text('label.axisT'),
    chip: false,
    align: 'left',
    font: 'text',
    italic: true,
    fontSize: AXIS_FONT_PX,
    style: WIRE,
  });

  // ---- 자취 — 판마다 같은 원점에서 적는다 ----
  // 같은 시간 배율이라 폭과 높이를 곧바로 견줄 수 있다. 지난 판은 점선으로 물러난다.
  all.forEach((r, i) => {
    if (sincePush(tl, r) < 0) return;
    const seconds = recordedSeconds(tl, r, c);
    const past = isPast(tl, all, i);
    const alpha = (past ? PAST_OPACITY : 1) * clearing;
    out.push({
      type: 'trajectory',
      id: `trace-${r.id}`,
      points: tracePoints(r, seconds, c),
      width: past ? PAST_TRACE_WIDTH_PX : TRACE_WIDTH_PX,
      opacity: alpha,
      style: { ...INK, lineStyle: past ? 'dashed' : 'solid' },
    });

    // 지금 적는 자리 — 멈춤이 끝날 때까지.
    if (!past && tl.u < tl.end(`${r.id}-rest`)) {
      out.push({
        type: 'body',
        id: `pen-${r.id}`,
        pos: graphPoint(seconds, voltageAfter(seconds, r, c), c),
        shape: 'point',
        style: INK,
      });
    }

    // 봉우리를 지난 뒤에 이름표를 붙인다 — 아직 오르는 중인 자취에 붙이면 꼭대기가 아니다.
    const peak = peakOf(r, c);
    if (seconds >= peak.tau) {
      out.push({
        type: 'readout',
        id: `peak-${r.id}`,
        anchor: {
          world: graphPoint(peak.tau, peak.volt, c),
          offset: r.labelSide === 'right' ? PEAK_LABEL_OFFSET_RIGHT : PEAK_LABEL_OFFSET,
        },
        ...peakLabel(r, c),
        chip: false,
        align: r.labelSide === 'right' ? 'left' : 'center',
        font: 'text',
        italic: true,
        fontSize: LABEL_FONT_PX,
        opacity: alpha,
        style: INK,
      });
    }
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
