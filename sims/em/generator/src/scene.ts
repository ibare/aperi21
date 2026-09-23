// ========================================================================
// generator — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 (drawOrder: 'scene') —
//   자기력선(lineSet) → 극 조각(body rect) · 극 글자(readout) → 손잡이가 도는 길(trajectory)
//   → 회로 도선(lineSet, 전구 · 스위치 자리를 비움) → 코일 모서리(lineSet) → 도선 단면(body)
//   · ⊙ 점(body point) · ⊗ 가위표(lineSet) → 굴대(body) → 손잡이 팔(lineSet) · 손잡이(body)
//   → 전구 빛(body circle · light) → 전구 기호(circuitElement lamp) → 빛살(lineSet)
//   → 스위치(circuitElement switch) → 손잡이 힘(vector).
//
// 색은 뜻마다 하나다 — 극 · 코일 · 도선 · 손잡이 · 회로 기호는 먹색(장치), 자기력선과 손잡이
// 길은 muted(배경 정보), **강조색은 「손이 미는 힘」 한 가지 뜻에만.** 전구가 켜졌는지는
// 역할색이 아니라 빛 채널(밝기)과 빛살 모양으로, 전류의 방향은 ⊙ · ⊗ 모양으로 보인다.
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
  bulbLight,
  coilAngle,
  crankForce,
  currentShare,
  filamentWarmth,
  forceLength,
  isClosed,
  readConstants,
} from './physics';
import {
  AXLE,
  COIL_RADIUS,
  ELEMENT_HALF,
  FIELD_LINE_COUNT,
  FIELD_LINE_STEP,
  KNOB_RADIUS,
  LAMP_RADIUS,
  LAMP_X,
  LEAD_OFFSET,
  LOOP_BOTTOM_INNER,
  LOOP_BOTTOM_OUTER,
  LOOP_LEFT,
  LOOP_RIGHT,
  LOOP_TOP,
  POLE_GAP_HALF,
  POLE_H,
  POLE_W,
  SCENE_BOUNDS,
  SWITCH_Y,
  WIRE_RADIUS,
  text,
} from './schema';
import type { GeneratorState } from './state';

// ------------------------------------------------------------------------
// 모양 — 굵기 · 글자 크기 · 불투명도(화면 px 또는 0~1). 물리량이 아니라 위계다 (C2).
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const FIELD = { colorRole: 'muted', emphasis: 'medium' } as const;
const FORCE = { colorRole: 'accent', emphasis: 'strong' } as const;

/** 자기력선 굵기 · 불투명도. 배경 정보라 가늘고 옅다. */
const FIELD_LINE_PX = 1;
const FIELD_LINE_OPACITY = 0.7;
/** 회로 도선 굵기(simple-circuit 와 같다 — 같은 대상은 같은 모양). */
const WIRE_PX = 2.5;
/** 옆에서 본 코일 모서리(두 도선을 잇는 선) 굵기. */
const COIL_EDGE_PX = 2;
/** ⊗ 가위표 획 굵기와, 도선 단면 반지름에 대한 가위표 반길이의 비. */
const CROSS_PX = 2;
const CROSS_FRACTION = 0.55;
/** 도선 단면 테두리 두께(월드). */
const WIRE_RIM = 0.035;
/** 손잡이 팔 굵기와 손잡이 반지름(월드). */
const CRANK_PX = 4;
const KNOB_SIZE = 0.13;
/** 굴대 반지름(월드). */
const HUB_SIZE = 0.08;
/** 손잡이가 도는 길 — 굵기 · 불투명도. 도는 것을 읽게 하는 안내선이다. */
const KNOB_PATH_PX = 1;
const KNOB_PATH_OPACITY = 0.6;
/** 원을 표본하는 점 수. */
const CIRCLE_SAMPLES = 72;
/** 극 조각 — S 극의 빛의 양, N 극에서 파낸 글자의 빛의 양, 극 글자 크기(lenzs-law 와 같다). */
const SOUTH_LUMINANCE = 0.33;
const KNOCKOUT_LUMINANCE = 0.04;
const POLE_FONT_PX = 14;
/** 전구 빛 원 — 기호 동그라미에 대한 비(simple-circuit 와 같다). */
const LAMP_GLOW_FRACTION = 0.92;
/** 빛살 — 전구 중심에서 잰 안쪽 · 바깥 끝(월드), 굵기(화면 px), 방향(도, 위쪽 반원). */
const RAY_INNER = 0.66;
const RAY_OUTER = 0.92;
const RAY_PX = 2;
const RAY_ANGLES_DEG = [30, 60, 90, 120, 150] as const;
/** 손잡이 힘 화살표 굵기(화면 px). */
const FORCE_PX = 3;

// ------------------------------------------------------------------------

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

function polar(r: number, angle: number): Vec2 {
  return [r * Math.cos(angle), r * Math.sin(angle)];
}

/** 원 둘레 표본(닫힌 궤적용). */
function circle(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    pts.push(add(center, polar(r, (2 * Math.PI * i) / CIRCLE_SAMPLES)));
  }
  return pts;
}

/** 도선 단면 하나 — 원 · 그 안의 ⊙ 점 또는 ⊗ 가위표. 전류 몫의 크기만큼 짙다. */
function conductor(id: string, pos: Vec2, share: number, flowing: boolean): Primitive[] {
  // 먹색 원 위에 바탕색 원을 겹쳐 테두리를 낸다 — 속이 바탕이라야 코일 모서리 선이
  // 가려지고 ⊙ · ⊗ 가 읽힌다. `outline: 'role'` 은 채움과 같은 색이라 쓸 수 없다.
  const out: Primitive[] = [
    { type: 'body', id: `${id}-rim`, pos, shape: 'circle', size: WIRE_RADIUS, glow: false, outline: 'none', style: INK },
    {
      type: 'body',
      id: `${id}-section`,
      pos,
      shape: 'circle',
      size: WIRE_RADIUS - WIRE_RIM,
      glow: false,
      outline: 'none',
      style: INK,
      luminance: 0,
    },
  ];
  if (!flowing) return out;
  const strength = Math.abs(share);
  if (share > 0) {
    // ⊙ — 화면 밖으로
    out.push({ type: 'body', id: `${id}-out`, pos, shape: 'point', style: INK, opacity: strength });
  } else {
    // ⊗ — 화면 안으로
    const h = WIRE_RADIUS * CROSS_FRACTION;
    out.push({
      type: 'lineSet',
      id: `${id}-in`,
      lines: [
        [add(pos, [-h, -h]), add(pos, [h, h])],
        [add(pos, [-h, h]), add(pos, [h, -h])],
      ],
      width: CROSS_PX,
      style: INK,
      opacity: strength,
    });
  }
  return out;
}

export function scene(params: {
  state: GeneratorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const closed = isClosed(tl);
  const theta = coilAngle(tl.t, c);
  const out: Primitive[] = [];

  // ---- 자기력선 — N 극면에서 S 극면으로 곧게 ----
  const faceL = AXLE[0] - POLE_GAP_HALF;
  const faceR = AXLE[0] + POLE_GAP_HALF;
  const fieldLines: Vec2[][] = [];
  for (let i = 0; i < FIELD_LINE_COUNT; i++) {
    const y = AXLE[1] + (i - (FIELD_LINE_COUNT - 1) / 2) * FIELD_LINE_STEP;
    fieldLines.push([
      [faceL, y],
      [faceR, y],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'field-lines',
    lines: fieldLines,
    width: FIELD_LINE_PX,
    opacity: FIELD_LINE_OPACITY,
    style: FIELD,
  });

  // ---- 극 조각 — N 은 먹, S 는 옅게 (lenzs-law · faradays-law 의 자석과 같은 모양) ----
  const nPos: Vec2 = [faceL - POLE_W / 2, AXLE[1]];
  const sPos: Vec2 = [faceR + POLE_W / 2, AXLE[1]];
  out.push(
    { type: 'body', id: 'pole-n', pos: nPos, shape: 'rect', size: [POLE_W, POLE_H], style: INK },
    {
      type: 'body',
      id: 'pole-s',
      pos: sPos,
      shape: 'rect',
      size: [POLE_W, POLE_H],
      style: INK,
      luminance: SOUTH_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-n-label',
      anchor: { world: nPos },
      text: text('label.poleN'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      style: INK,
      luminance: KNOCKOUT_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-s-label',
      anchor: { world: sPos },
      text: text('label.poleS'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      style: INK,
    },
  );

  // ---- 손잡이가 도는 길 ----
  out.push({
    type: 'trajectory',
    id: 'knob-path',
    points: circle(AXLE, KNOB_RADIUS),
    closed: true,
    width: KNOB_PATH_PX,
    opacity: KNOB_PATH_OPACITY,
    style: { ...FIELD, lineStyle: 'dotted' },
  });

  // ---- 회로 도선 — 발전기 굴대에서 두 가닥이 내려와 전구 · 스위치를 한 바퀴 돈다 ----
  // 전구 · 스위치 기호는 제 리드선을 스스로 그으므로 그 자리(가운데 ± 1)는 비운다.
  const leadIn = AXLE[0] + LEAD_OFFSET;
  const leadOut = AXLE[0] - LEAD_OFFSET;
  out.push({
    type: 'lineSet',
    id: 'wires',
    lines: [
      [
        [leadIn, AXLE[1]],
        [leadIn, LOOP_BOTTOM_INNER],
        [LOOP_LEFT, LOOP_BOTTOM_INNER],
        [LOOP_LEFT, LOOP_TOP],
        [LAMP_X - ELEMENT_HALF, LOOP_TOP],
      ],
      [
        [LAMP_X + ELEMENT_HALF, LOOP_TOP],
        [LOOP_RIGHT, LOOP_TOP],
        [LOOP_RIGHT, SWITCH_Y + ELEMENT_HALF],
      ],
      [
        [LOOP_RIGHT, SWITCH_Y - ELEMENT_HALF],
        [LOOP_RIGHT, LOOP_BOTTOM_OUTER],
        [leadOut, LOOP_BOTTOM_OUTER],
        [leadOut, AXLE[1]],
      ],
    ],
    width: WIRE_PX,
    style: INK,
  });

  // ---- 코일 — 굴대 쪽에서 보면 모서리 한 줄과 도선 단면 둘 ----
  const wireA = add(AXLE, polar(COIL_RADIUS, theta));
  const wireB = add(AXLE, polar(COIL_RADIUS, theta + Math.PI));
  out.push({
    type: 'lineSet',
    id: 'coil-edge',
    lines: [[wireA, wireB]],
    width: COIL_EDGE_PX,
    style: INK,
  });
  const share = currentShare(theta);
  out.push(...conductor('wire-a', wireA, share, closed), ...conductor('wire-b', wireB, -share, closed));

  // ---- 굴대 · 손잡이 팔 · 손잡이 — 코일과 한 몸으로 돈다(팔은 코일 모서리에 직각) ----
  const crankAngle = theta + Math.PI / 2;
  const knob = add(AXLE, polar(KNOB_RADIUS, crankAngle));
  out.push(
    {
      type: 'lineSet',
      id: 'crank-arm',
      lines: [[AXLE, knob]],
      width: CRANK_PX,
      style: INK,
    },
    {
      type: 'body',
      id: 'hub',
      pos: AXLE,
      shape: 'circle',
      size: HUB_SIZE,
      glow: false,
      style: INK,
    },
    {
      type: 'body',
      id: 'knob',
      pos: knob,
      shape: 'circle',
      size: KNOB_SIZE,
      glow: false,
      outline: 'background',
      style: INK,
    },
  );

  // ---- 전구 — 빛 원을 기호 아래에 깐다. 온기는 필라멘트 지연을 따른다 ----
  const light = bulbLight(filamentWarmth(tl, c), c);
  const lampPos: Vec2 = [LAMP_X, LOOP_TOP];
  out.push({
    type: 'body',
    id: 'lamp-light',
    pos: lampPos,
    shape: 'circle',
    size: LAMP_RADIUS * LAMP_GLOW_FRACTION,
    outline: 'none',
    glow: closed,
    light,
  });
  out.push({ type: 'circuitElement', id: 'lamp', subtype: 'lamp', pos: lampPos, rotation: 0 });
  if (light > 0) {
    out.push({
      type: 'lineSet',
      id: 'lamp-rays',
      lines: RAY_ANGLES_DEG.map((deg) => {
        const a = (deg * Math.PI) / 180;
        return [add(lampPos, polar(RAY_INNER, a)), add(lampPos, polar(RAY_OUTER, a))];
      }),
      width: RAY_PX,
      opacity: light,
      style: INK,
    });
  }

  // ---- 스위치 — 열림 단계에는 젖혀져 있고, 닫힘 단계에는 붙어 있다 ----
  out.push({
    type: 'circuitElement',
    id: 'switch',
    subtype: 'switch',
    pos: [LOOP_RIGHT, SWITCH_Y],
    rotation: 90,
    state: closed ? 'closed' : 'open',
  });

  // ---- 손이 미는 힘 — 손잡이에서 도는 방향(반시계)으로. 강조색은 이것 하나 ----
  const force = crankForce(theta, closed, c);
  const tangent = polar(1, crankAngle + Math.PI / 2);
  const len = forceLength(force, c);
  // 손잡이 둘레에서 출발한다 — 가운데서 출발하면 마찰만 남은 짧은 화살표가 손잡이에 묻힌다.
  out.push({
    type: 'vector',
    id: 'crank-force',
    from: add(knob, [tangent[0] * KNOB_SIZE, tangent[1] * KNOB_SIZE]),
    delta: [tangent[0] * len, tangent[1] * len],
    width: FORCE_PX,
    outline: 'background',
    label: text('label.force'),
    style: FORCE,
  });

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
