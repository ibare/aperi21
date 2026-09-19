// ========================================================================
// electromagnet — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 가운데에 누운 쇠못(`body` rect + 머리 + 뾰족한 끝 `region`), 그 위를 감은 코일
// (앞 · 뒤 가닥을 `lineSet` 둘로 갈라 못 앞뒤로 지나가게), 코일 양 끝에서 올라간
// 도선이 윗변에서 스위치 · 전지와 한 고리를 이룬다. 아래는 탁자와 끝마다의 클립 더미.
//
// 스위치 날이 닿는 동안에만 못 양 끝에 `N` · `S` 가 서고 클립이 사슬로 매달린다.
// 날이 들리면 둘 다 사라진다 — 「전류가 흐를 때만」 이 이 한 쌍으로 일어난다.
//
// 색은 뜻마다 하나다. 쇠못은 muted(쇠), 코일 · 도선 · 전지 · 스위치는 한 회로라 primary,
// 클립 · 전류 화살표는 먹색, **강조색은 극(`N` · `S`) 한 가지 뜻에만** 쓴다. 두 극은
// 색이 아니라 글자로 가른다 — N 빨강 · S 파랑 관례색을 쓰지 않는다 (S-piece).
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
import { pileLayout, readConstants, roundFrame, type ClipPose } from './physics';
import {
  ARROW_X,
  CELL_X,
  CHAIN_X,
  CLIP_HALF_WIDTH,
  CLIP_HOOK,
  CLIP_LENGTH,
  COIL_HALF,
  COIL_LEFT,
  COIL_RIGHT,
  HEAD_HALF,
  HEAD_WIDTH,
  NAIL_HALF,
  NAIL_LEFT,
  NAIL_RIGHT,
  NAIL_Y,
  SCENE_BOUNDS,
  SWITCH_CONTACT_X,
  SWITCH_HINGE_X,
  TABLE_Y,
  TIP_LENGTH,
  TOP_WIRE_Y,
  text,
} from './schema';
import type { ElectromagnetState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 쇠못 — 쇠. */
const IRON = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 코일 · 도선 · 전지 · 스위치 — 한 회로. */
const CIRCUIT = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 클립 · 전류 화살표. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 극 — 강조색의 유일한 뜻. */
const POLE = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 감은 수 · 전류 값. */
const NOTE = { colorRole: 'muted', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 도선 · 코일 앞 가닥 굵기. */
const WIRE_PX = 2.2;
const COIL_FRONT_PX = 2.2;
/** 코일 뒤 가닥 — 못 뒤로 지나가 가늘고 옅다. */
const COIL_BACK_PX = 1.4;
const COIL_BACK_OPACITY = 0.45;
/** 감긴 고리 반 바퀴를 이루는 점 개수. */
const HALF_TURN_SAMPLES = 12;

/** 전지 — 두 판 사이 간격, 긴 판(+) · 짧은 판(−)의 반 길이와 굵기. */
const PLATE_GAP = 0.14;
const LONG_HALF = 0.26;
const SHORT_HALF = 0.14;
const LONG_PX = 2.2;
const SHORT_PX = 4;

/** 스위치 — 다 열렸을 때 날이 들리는 각(라디안), 닿는 곳 · 경첩 점의 반지름. */
const SWITCH_OPEN_RAD = 0.52;
const SWITCH_DOT = 0.06;

/** 전류 화살표 — 윗변에서 띄운 높이, 굵기, 머리(월드). 값 글자가 화살표 꼬리 왼쪽으로 띄운 거리. */
const ARROW_RISE = 0.3;
const ARROW_PX = 2.4;
const ARROW_HEAD = 0.14;
const AMPS_GAP = 0.42;

/** 클립 선 굵기. */
const CLIP_PX = 1.6;
/**
 * 클립 철사가 접히는 모양 — 바깥 고리가 시작하는 자리(길이 대비), 둘째 · 셋째 고리의
 * 반지름(반 폭 대비), 안쪽 고리의 끝 · 철사 끝 자리(길이 대비), 가운데 고리의 높이(반 폭 대비).
 */
const CLIP_OUTER_START = 0.35;
const CLIP_R2 = 0.75;
const CLIP_R3 = 0.35;
const CLIP_INNER_TURN = 0.3;
const CLIP_WIRE_END = 0.3;
const CLIP_MID_V = 0.5;
const CLIP_END_V = 0.2;

/** 극 글자 — 크기와 못 끝에서 띄운 거리. */
const POLE_PX = 20;
const POLE_GAP = 0.32;
/** 감은 수 · 전류 글자 크기, 감은 수 글자가 코일 아래로 띄운 거리. */
const LABEL_PX = 13;
const TURNS_GAP = 0.42;

// ------------------------------------------------------------------------
// 코일
// ------------------------------------------------------------------------

/**
 * 못을 감은 나선을 옆에서 본 가닥들. 반 바퀴마다 선 하나 — 앞(보는 쪽) 반 바퀴와 뒤 반
 * 바퀴를 따로 모은다. 꼭대기에서 시작해 꼭대기에서 끝나므로 양 끝 도선이 위로 올라간다.
 */
function coilStrands(turns: number): { front: Vec2[][]; back: Vec2[][] } {
  const n = Math.max(1, Math.round(turns));
  const pitch = (COIL_RIGHT - COIL_LEFT) / n;
  const front: Vec2[][] = [];
  const back: Vec2[][] = [];
  for (let j = 0; j < n; j++) {
    for (const half of [0, 1]) {
      const pts: Vec2[] = [];
      for (let k = 0; k <= HALF_TURN_SAMPLES; k++) {
        const theta = (half + k / HALF_TURN_SAMPLES) * Math.PI;
        pts.push([COIL_LEFT + pitch * (j + theta / (2 * Math.PI)), NAIL_Y + COIL_HALF * Math.cos(theta)]);
      }
      (half === 0 ? front : back).push(pts);
    }
  }
  return { front, back };
}

/** 화면에 선 코일 — 감은 수와 짙기. 감은 수가 그대로면 하나, 바뀌는 중이면 둘이다. */
interface CoilLayer {
  turns: number;
  shown: number;
  strands: { front: Vec2[][]; back: Vec2[][] };
}

function coilLayers(prevTurns: number, nowTurns: number, wind: number): CoilLayer[] {
  if (prevTurns === nowTurns || wind >= 1) {
    return [{ turns: nowTurns, shown: 1, strands: coilStrands(nowTurns) }];
  }
  return [
    { turns: prevTurns, shown: 1 - wind, strands: coilStrands(prevTurns) },
    { turns: nowTurns, shown: wind, strands: coilStrands(nowTurns) },
  ];
}

// ------------------------------------------------------------------------
// 클립
// ------------------------------------------------------------------------

/** 반원 호의 점들 — 가운데 · 반지름 · 시작각 → 끝각. */
function arc(center: Vec2, r: number, from: number, to: number): Vec2[] {
  return Array.from({ length: HALF_TURN_SAMPLES + 1 }, (_, k): Vec2 => {
    const a = from + ((to - from) * k) / HALF_TURN_SAMPLES;
    return [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)];
  });
}

/**
 * 클립 하나의 모양(국소 좌표). u 는 긴 축, v 는 폭. 바깥 고리에서 시작해 안쪽으로
 * 세 번 접히는 철사 한 가닥이다.
 */
function clipShape(): Vec2[] {
  const h = CLIP_LENGTH / 2;
  const w = CLIP_HALF_WIDTH;
  const r2 = CLIP_R2 * w;
  const r3 = CLIP_R3 * w;
  const innerEnd = h - CLIP_INNER_TURN * CLIP_LENGTH;
  // 둘째 고리는 −w 에서 +CLIP_MID_V·w 로, 셋째 고리는 +CLIP_MID_V·w 에서 −CLIP_END_V·w 로 접힌다.
  const mid2 = (CLIP_MID_V * w - w) / 2;
  const mid3 = (CLIP_MID_V * w - CLIP_END_V * w) / 2;
  return [
    [-h + CLIP_OUTER_START * CLIP_LENGTH, w],
    ...arc([h - w, 0], w, Math.PI / 2, -Math.PI / 2),
    ...arc([-h + r2, mid2], r2, -Math.PI / 2, -1.5 * Math.PI),
    ...arc([innerEnd, mid3], r3, Math.PI / 2, -Math.PI / 2),
    [-h + CLIP_WIRE_END * CLIP_LENGTH, -CLIP_END_V * w],
  ];
}

const CLIP_SHAPE = clipShape();

function placeClip(pose: ClipPose): Vec2[] {
  const c = Math.cos(pose.angle);
  const s = Math.sin(pose.angle);
  return CLIP_SHAPE.map(([u, v]): Vec2 => [pose.pos[0] + u * c - v * s, pose.pos[1] + u * s + v * c]);
}

/** 사슬의 j 번째 자리 — 못 밑면에 걸린 것이 0 번, 아래로 하나씩 걸려 내려간다. */
function chainPose(end: number, j: number): ClipPose {
  const top = NAIL_Y - NAIL_HALF - j * (CLIP_LENGTH - CLIP_HOOK);
  return { pos: [CHAIN_X[end]!, top - CLIP_LENGTH / 2], angle: -Math.PI / 2 };
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

function blendPose(from: ClipPose, to: ClipPose, f: number): ClipPose {
  return {
    pos: [lerp(from.pos[0], to.pos[0], f), lerp(from.pos[1], to.pos[1], f)],
    angle: lerp(from.angle, to.angle, f),
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: ElectromagnetState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('electromagnet: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const f = roundFrame(timeline, c);
  const out: Primitive[] = [];

  // ---- 탁자 ----
  out.push({ type: 'surface', id: 'table', geometry: { kind: 'ground', y: TABLE_Y }, material: 'solid' });

  // ---- 코일 뒤 가닥 → 쇠못 → 코일 앞 가닥 ----
  // 감은 수가 바뀌는 판에서는 감기 단계 동안 앞 판의 코일이 옅어지고 새 코일이 짙어진다.
  // 사이 값의 코일을 만들지 않는다 — 화면의 감은 수는 선언한 값 둘 가운데 하나다.
  const coils = coilLayers(f.prev.turns, f.now.turns, f.wind);
  coils.forEach((coil, i) => {
    out.push({
      type: 'lineSet',
      id: `coil-back-${i}`,
      lines: coil.strands.back,
      width: COIL_BACK_PX,
      opacity: COIL_BACK_OPACITY * coil.shown,
      style: CIRCUIT,
    });
  });

  out.push({
    type: 'body',
    id: 'nail',
    pos: [(NAIL_LEFT + NAIL_RIGHT) / 2, NAIL_Y],
    shape: 'rect',
    size: [NAIL_RIGHT - NAIL_LEFT, 2 * NAIL_HALF],
    outline: 'none',
    style: IRON,
  });
  out.push({
    type: 'body',
    id: 'nail-head',
    pos: [NAIL_LEFT - HEAD_WIDTH / 2, NAIL_Y],
    shape: 'rect',
    size: [HEAD_WIDTH, 2 * HEAD_HALF],
    outline: 'none',
    style: IRON,
  });
  out.push({
    type: 'region',
    id: 'nail-tip',
    points: [
      [NAIL_RIGHT, NAIL_Y + NAIL_HALF],
      [NAIL_RIGHT + TIP_LENGTH, NAIL_Y],
      [NAIL_RIGHT, NAIL_Y - NAIL_HALF],
    ],
    fillOpacity: 1,
    style: IRON,
  });

  coils.forEach((coil, i) => {
    out.push({
      type: 'lineSet',
      id: `coil-front-${i}`,
      lines: coil.strands.front,
      width: COIL_FRONT_PX,
      opacity: coil.shown,
      style: CIRCUIT,
    });
  });

  // ---- 회로 ----
  const coilTop = NAIL_Y + COIL_HALF;
  const half = PLATE_GAP / 2;
  const wires: Vec2[][] = [
    [
      [COIL_LEFT, coilTop],
      [COIL_LEFT, TOP_WIRE_Y],
      [SWITCH_CONTACT_X, TOP_WIRE_Y],
    ],
    [
      [SWITCH_HINGE_X, TOP_WIRE_Y],
      [CELL_X[0]! - half, TOP_WIRE_Y],
    ],
    [
      [CELL_X[0]! + half, TOP_WIRE_Y],
      [CELL_X[1]! - half, TOP_WIRE_Y],
    ],
    [
      [CELL_X[1]! + half, TOP_WIRE_Y],
      [COIL_RIGHT, TOP_WIRE_Y],
      [COIL_RIGHT, coilTop],
    ],
  ];
  wires.forEach((points, i) => {
    out.push({ type: 'trajectory', id: `wire-${i}`, points, width: WIRE_PX, style: CIRCUIT });
  });

  // 전지 자리마다: 이번 판에 그 자리가 쓰이는지로 짙기가 정해진다. 감기 동안 앞 판의
  // 짙기에서 옮겨 가고, 빈 자리는 같은 몫만큼 도선이 잇는다. 전류는 윗변을 왼쪽에서
  // 오른쪽으로 흐르므로 긴 판(+)이 오른쪽이다.
  CELL_X.forEach((x, s) => {
    const was = s < f.prev.cells ? 1 : 0;
    const is = s < f.now.cells ? 1 : 0;
    const shown = lerp(was, is, f.wind);
    if (shown > 0) {
      out.push({
        type: 'trajectory',
        id: `cell-${s}-minus`,
        points: [
          [x - half, TOP_WIRE_Y - SHORT_HALF],
          [x - half, TOP_WIRE_Y + SHORT_HALF],
        ],
        width: SHORT_PX,
        opacity: shown,
        style: CIRCUIT,
      });
      out.push({
        type: 'trajectory',
        id: `cell-${s}-plus`,
        points: [
          [x + half, TOP_WIRE_Y - LONG_HALF],
          [x + half, TOP_WIRE_Y + LONG_HALF],
        ],
        width: LONG_PX,
        opacity: shown,
        style: CIRCUIT,
      });
    }
    if (shown < 1) {
      out.push({
        type: 'trajectory',
        id: `cell-${s}-bridge`,
        points: [
          [x - half, TOP_WIRE_Y],
          [x + half, TOP_WIRE_Y],
        ],
        width: WIRE_PX,
        opacity: 1 - shown,
        style: CIRCUIT,
      });
    }
  });

  // 스위치 — 오른쪽 경첩에서 왼쪽 닿는 곳을 향한 날. 열리면 위로 들린다.
  const bladeLen = SWITCH_HINGE_X - SWITCH_CONTACT_X;
  const lift = SWITCH_OPEN_RAD * (1 - f.closed);
  out.push({
    type: 'trajectory',
    id: 'switch-blade',
    points: [
      [SWITCH_HINGE_X, TOP_WIRE_Y],
      [SWITCH_HINGE_X - bladeLen * Math.cos(lift), TOP_WIRE_Y + bladeLen * Math.sin(lift)],
    ],
    width: WIRE_PX,
    style: CIRCUIT,
  });
  for (const [id, x] of [
    ['switch-contact', SWITCH_CONTACT_X],
    ['switch-hinge', SWITCH_HINGE_X],
  ] as const) {
    out.push({
      type: 'body',
      id,
      pos: [x, TOP_WIRE_Y],
      shape: 'circle',
      size: SWITCH_DOT,
      glow: false,
      outline: 'none',
      style: CIRCUIT,
    });
  }

  // 전류 — 흐르는 동안만. 화살표 길이가 전류에 비례하고, 값 글자는 선언값 그대로다.
  if (f.flowing) {
    const len = f.now.current * c.arrowScale;
    out.push({
      type: 'vector',
      id: 'current',
      from: [ARROW_X, TOP_WIRE_Y + ARROW_RISE],
      delta: [len, 0],
      headSize: ARROW_HEAD,
      width: ARROW_PX,
      label: text('label.current'),
      labelSide: 'ccw',
      style: INK,
    });
    out.push({
      type: 'readout',
      id: 'amps',
      anchor: { world: [ARROW_X - AMPS_GAP, TOP_WIRE_Y + ARROW_RISE] },
      text: text('label.amps'),
      vars: { i: String(f.now.current) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: NOTE,
    });
  }

  // ---- 클립 ----
  // 끝마다 더미에서 사슬 x 에 가까운 k 개가 매달린다. 나머지는 탁자에 그대로 있다.
  const pile = pileLayout(c);
  const clips: Vec2[][] = [];
  pile.forEach((spots, end) => {
    const k = Math.max(0, Math.min(spots.length, Math.round(f.now.clips)));
    spots.forEach((spot, j) => {
      const pose = j < k ? blendPose(spot, chainPose(end, j), f.lifted) : spot;
      clips.push(placeClip(pose));
    });
  });
  out.push({ type: 'lineSet', id: 'clips', lines: clips, width: CLIP_PX, style: INK });

  // ---- 극 ----
  // 전류가 흐르는 동안만 선다. 끊기는 순간 함께 사라진다.
  if (f.flowing) {
    out.push({
      type: 'readout',
      id: 'pole-n',
      anchor: { world: [NAIL_LEFT - HEAD_WIDTH - POLE_GAP, NAIL_Y] },
      text: text('label.north'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: POLE_PX,
      style: POLE,
    });
    out.push({
      type: 'readout',
      id: 'pole-s',
      anchor: { world: [NAIL_RIGHT + TIP_LENGTH + POLE_GAP, NAIL_Y] },
      text: text('label.south'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: POLE_PX,
      style: POLE,
    });
  }

  // ---- 감은 수 ----
  // 코일과 같은 짙기로 옮겨 간다. 값은 선언값 그대로다.
  coils.forEach((coil, i) => {
    out.push({
      type: 'readout',
      id: `turns-${i}`,
      anchor: { world: [(COIL_LEFT + COIL_RIGHT) / 2, NAIL_Y - COIL_HALF - TURNS_GAP] },
      text: text('label.turns'),
      vars: { n: String(coil.turns) },
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: coil.shown,
      style: NOTE,
    });
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
