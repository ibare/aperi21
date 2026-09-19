// ========================================================================
// motional-emf — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 종이 안으로 들어가는 자기장 ⊗ 무늬 → `lineSet` 하나(고리 표본 + 가위표 두 획).
// - 레일 두 줄 → `lineSet`. 왼쪽 끝은 열려 있다 — 회로를 닫지 않는다.
// - 도체 막대 → `body` rect. 그 안에 고정 이온 `+` 줄(`lineSet` 획)과 전자 점(`particleSystem`).
// - 막대 양 끝의 `+` · `−`, 전자 표식 `e⁻`, 자기장 `B` → `readout`.
// - 움직임 `v` · 전자를 미는 힘 `F` → `vector` + `readout` 이름표.
// - 양 끝 사이 전압 `ε` → 괄호 `lineSet` + `readout`.
//
// 색은 뜻마다 하나다. 이온 · 전자 · 표식은 먹색, 자기장 · 레일 · 막대는 배경 정보라
// muted, 움직임은 primary, **강조색은 전자를 미는 힘 한 뜻에만** 쓴다.
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
import { pileOf, readConstants, rodAfter, rounds, separation, sinceStart, type Round } from './physics';
import {
  FIELD_STEP,
  FIELD_X0,
  FIELD_X1,
  FIELD_Y0,
  FIELD_Y1,
  ION_Y0,
  ION_Y1,
  PILE_Y,
  RAIL_X0,
  RAIL_X1,
  RAIL_Y,
  ROD_HALF,
  ROD_W,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { MotionalEmfState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 이온 · 전자 · 표식 · 전압 괄호. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 레일 — 배경 정보. */
const RAIL = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 자기장 무늬 · 막대 몸 — 가장 옅은 배경. */
const FIELD = { colorRole: 'muted', emphasis: 'subtle' } as const;
/** 막대의 움직임. */
const MOTION = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 전자를 미는 힘 — 강조색은 이 한 뜻에만. */
const FORCE = { colorRole: 'accent', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** ⊗ 고리 반지름 · 가위표 팔(월드) · 고리 표본 수. */
const FIELD_RING_R = 0.075;
const FIELD_ARM = 0.045;
const FIELD_RING_SAMPLES = 14;
/** ⊗ 무늬 선 굵기. */
const FIELD_WIDTH_PX = 1.1;
/** `B` 이름표가 무늬 왼쪽 위 끝에서 비켜서는 거리(월드). */
const FIELD_LABEL_GAP = 0.3;

/** 레일 선 굵기. */
const RAIL_WIDTH_PX = 2.4;

/** 이온 `+` 획의 팔 길이(월드) · 굵기. */
const ION_ARM = 0.05;
const ION_WIDTH_PX = 1.5;
/** 이온은 막대 가운데에서 왼쪽, 전자는 오른쪽으로 비켜 짝을 이룬다(월드). */
const ION_DX = 0.08;
const ELECTRON_DX = 0.08;
/** 전자 점 반지름(화면 px). */
const ELECTRON_PX = 2.8;
/** 아래 끝에 몰린 전자의 자리 — 한 줄에 두 개, 가로 · 세로 간격(월드). */
const PILE_PER_ROW = 2;
const PILE_GAP_X = 0.14;
const PILE_GAP_Y = 0.1;

/** 막대 끝 `+` · `−` 표식 — 끝에서 뜨는 거리(월드) · 글자 크기. */
const END_GAP = 0.2;
const END_FONT_PX = 18;
/** `e⁻` 표식 — 막대 오른쪽 가장자리에서 비켜서는 거리(월드). */
const ELECTRON_LABEL_GAP = 0.12;
/**
 * 이름표 높이 — ⊗ 줄(±0.25 · ±0.75 · ±1.25) 사이의 빈 줄(0 · ±0.5)에 둔다. 막대가 움직여
 * 가로로는 언제든 ⊗ 와 겹치므로 세로로 비켜 선다.
 */
const ELECTRON_LABEL_Y = -0.5;
const FORCE_LABEL_Y = 0;

/** 움직임 화살표 — 높이 · 막대 가장자리에서 띄움(월드) · 굵기 · 머리. */
const MOTION_Y = 0.5;
const MOTION_GAP = 0.12;
const MOTION_WIDTH_PX = 2.4;
const MOTION_HEAD = 0.13;
/** 힘 화살표 — 출발 높이 · 막대 가장자리에서 띄움(월드) · 굵기 · 머리. */
const FORCE_Y = 0.25;
const FORCE_GAP = 0.18;
const FORCE_WIDTH_PX = 2.4;
const FORCE_HEAD = 0.12;
/** 화살표 이름표 띄움(화면 px). */
const MOTION_LABEL_OFFSET: Vec2 = [7, 0];
const FORCE_LABEL_OFFSET: Vec2 = [9, 0];

/** 전압 괄호 — 막대 왼쪽 가장자리에서 띄움 · 끝 갈고리 길이(월드) · 굵기. */
const BRACKET_GAP = 0.2;
const BRACKET_TICK = 0.1;
const BRACKET_WIDTH_PX = 1.4;
/** `ε` 이름표 띄움(화면 px). */
const EMF_LABEL_OFFSET: Vec2 = [-8, 0];

/** 기호 글자 크기. */
const LABEL_FONT_PX = 14;

// ------------------------------------------------------------------------
// 자기장 ⊗
// ------------------------------------------------------------------------

function ring(cx: number, cy: number): Vec2[] {
  return Array.from({ length: FIELD_RING_SAMPLES + 1 }, (_, k): Vec2 => {
    const a = (2 * Math.PI * k) / FIELD_RING_SAMPLES;
    return [cx + FIELD_RING_R * Math.cos(a), cy + FIELD_RING_R * Math.sin(a)];
  });
}

/** 종이 안으로 들어가는 균일한 자기장 — 같은 간격의 ⊗. 시각과 무관하다. */
function fieldStrokes(): Vec2[][] {
  const out: Vec2[][] = [];
  const nx = Math.round((FIELD_X1 - FIELD_X0) / FIELD_STEP);
  const ny = Math.round((FIELD_Y1 - FIELD_Y0) / FIELD_STEP);
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = FIELD_X0 + i * FIELD_STEP;
      const y = FIELD_Y0 + j * FIELD_STEP;
      out.push(ring(x, y));
      out.push([
        [x - FIELD_ARM, y + FIELD_ARM],
        [x + FIELD_ARM, y - FIELD_ARM],
      ]);
      out.push([
        [x + FIELD_ARM, y + FIELD_ARM],
        [x - FIELD_ARM, y - FIELD_ARM],
      ]);
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 막대 속 전하
// ------------------------------------------------------------------------

function rowY(i: number, rows: number): number {
  return rows <= 1 ? (ION_Y0 + ION_Y1) / 2 : ION_Y0 + (i * (ION_Y1 - ION_Y0)) / (rows - 1);
}

/** 이온 `+` 획 — 막대에 박혀 움직이지 않는다. */
function ionStrokes(rodX: number, rows: number): Vec2[][] {
  const out: Vec2[][] = [];
  const x = rodX - ION_DX;
  for (let i = 0; i < rows; i++) {
    const y = rowY(i, rows);
    out.push([
      [x - ION_ARM, y],
      [x + ION_ARM, y],
    ]);
    out.push([
      [x, y - ION_ARM],
      [x, y + ION_ARM],
    ]);
  }
  return out;
}

/**
 * 전자 자리. 몰림 0 이면 이온마다 짝을 이룬다(고르다). 몰림 1 이면 전자가 모두
 * `pile` 줄만큼 아래로 옮겨 — 가운데는 여전히 짝이 맞고(속은 중성), 맨 위 `pile` 개
 * 이온은 짝을 잃고, 맨 아래 `pile` 개 전자는 아래 끝에 몰린다.
 */
function electronPositions(rodX: number, rows: number, pile: number, sep: number): Vec2[] {
  return Array.from({ length: rows }, (_, i): Vec2 => {
    const rest: Vec2 = [rodX + ELECTRON_DX, rowY(i, rows)];
    let target: Vec2;
    if (i >= pile) {
      target = [rodX + ELECTRON_DX, rowY(i - pile, rows)];
    } else {
      const col = i % PILE_PER_ROW;
      const row = Math.floor(i / PILE_PER_ROW);
      target = [
        rodX + (col - (PILE_PER_ROW - 1) / 2) * PILE_GAP_X,
        PILE_Y - row * PILE_GAP_Y,
      ];
    }
    return [rest[0] + (target[0] - rest[0]) * sep, rest[1] + (target[1] - rest[1]) * sep];
  });
}

// ------------------------------------------------------------------------
// 시간표 읽기
// ------------------------------------------------------------------------

/** 이 판의 막대가 화면에 있는 동안인가 — 나타남 단계 시작부터 사라짐 단계 끝까지. */
function onStage(tl: TimelineFrame, r: Round): boolean {
  return tl.u >= tl.start(`${r.id}-in`) && tl.u < tl.end(`${r.id}-out`);
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: MotionalEmfState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('motional-emf: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const rows = Math.max(1, Math.round(c.ionRows));
  const out: Primitive[] = [];

  // ---- 자기장 ⊗ ----
  out.push({
    type: 'lineSet',
    id: 'field',
    lines: fieldStrokes(),
    width: FIELD_WIDTH_PX,
    style: FIELD,
  });
  out.push({
    type: 'readout',
    id: 'field-label',
    anchor: { world: [FIELD_X0 - FIELD_LABEL_GAP, FIELD_Y1] },
    text: text('label.field'),
    chip: false,
    align: 'center',
    font: 'text',
    italic: true,
    weight: 'bold',
    fontSize: LABEL_FONT_PX,
    style: RAIL,
  });

  // ---- 레일 ----
  out.push({
    type: 'lineSet',
    id: 'rails',
    lines: [
      [
        [RAIL_X0, RAIL_Y],
        [RAIL_X1, RAIL_Y],
      ],
      [
        [RAIL_X0, -RAIL_Y],
        [RAIL_X1, -RAIL_Y],
      ],
    ],
    width: RAIL_WIDTH_PX,
    style: RAIL,
  });

  const r = rounds(c).find((x) => onStage(tl, x));
  if (!r) return out;

  const alpha = tl.at(`${r.id}-in`) * (1 - tl.at(`${r.id}-out`));
  const rod = rodAfter(sinceStart(tl, r), r, c);
  const rodX = -c.travel / 2 + rod.s;
  const sep = separation(tl, r);
  const pile = pileOf(r, c);
  const fast = r.times !== 1;
  const times = { k: String(c.speedRatio) };

  // ---- 막대 ----
  out.push({
    type: 'body',
    id: 'rod',
    pos: [rodX, 0],
    shape: 'rect',
    size: [ROD_W, 2 * ROD_HALF],
    opacity: alpha,
    style: FIELD,
  });

  // ---- 이온 · 전자 ----
  out.push({
    type: 'lineSet',
    id: 'ions',
    lines: ionStrokes(rodX, rows),
    width: ION_WIDTH_PX,
    opacity: alpha,
    style: INK,
  });
  out.push({
    type: 'particleSystem',
    id: 'electrons',
    positions: electronPositions(rodX, rows, pile, sep),
    sizes: ELECTRON_PX,
    opacity: alpha,
    style: INK,
  });
  out.push({
    type: 'readout',
    id: 'electron-label',
    anchor: { world: [rodX + ROD_W / 2 + ELECTRON_LABEL_GAP, ELECTRON_LABEL_Y] },
    text: text('label.electron'),
    chip: false,
    align: 'left',
    font: 'text',
    fontSize: LABEL_FONT_PX,
    opacity: alpha,
    style: INK,
  });

  // ---- 양 끝 + · − — 전자가 몰린 만큼 드러난다 ----
  if (sep > 0) {
    for (const [id, y, label] of [
      ['end-plus', ROD_HALF + END_GAP, text('label.plus')],
      ['end-minus', -ROD_HALF - END_GAP, text('label.minus')],
    ] as const) {
      out.push({
        type: 'readout',
        id,
        anchor: { world: [rodX, y] },
        text: label,
        chip: false,
        align: 'center',
        font: 'text',
        weight: 'bold',
        fontSize: END_FONT_PX,
        opacity: alpha * sep,
        style: INK,
      });
    }

    // ---- 전압 괄호 ε ----
    const bx = rodX - ROD_W / 2 - BRACKET_GAP;
    out.push({
      type: 'lineSet',
      id: 'emf-bracket',
      lines: [
        [
          [bx + BRACKET_TICK, ROD_HALF],
          [bx, ROD_HALF],
          [bx, -ROD_HALF],
          [bx + BRACKET_TICK, -ROD_HALF],
        ],
      ],
      width: BRACKET_WIDTH_PX,
      opacity: alpha * sep,
      style: INK,
    });
    out.push({
      type: 'readout',
      id: 'emf-label',
      anchor: { world: [bx, 0], offset: EMF_LABEL_OFFSET },
      text: fast ? text('label.emfTimes') : text('label.emf'),
      vars: fast ? times : undefined,
      chip: false,
      align: 'right',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      opacity: alpha * sep,
      style: INK,
    });
  }

  // ---- 움직임 · 힘 — 움직이는 동안만 ----
  // 둘 다 길이가 속력에 비례한다. 멈추면 함께 사라진다 — 0 길이 화살표는 향이 있는 것처럼 보인다.
  if (rod.speed > 0) {
    const edge = rodX + ROD_W / 2;
    const vLen = rod.speed * c.arrowScale;
    out.push({
      type: 'vector',
      id: 'motion',
      from: [edge + MOTION_GAP, MOTION_Y],
      delta: [vLen, 0],
      width: MOTION_WIDTH_PX,
      headSize: MOTION_HEAD,
      opacity: alpha,
      style: MOTION,
    });
    out.push({
      type: 'readout',
      id: 'motion-label',
      anchor: { world: [edge + MOTION_GAP + vLen, MOTION_Y], offset: MOTION_LABEL_OFFSET },
      text: fast ? text('label.speedTimes') : text('label.speed'),
      vars: fast ? times : undefined,
      chip: false,
      align: 'left',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      opacity: alpha,
      style: MOTION,
    });

    const fLen = rod.speed * c.forceScale;
    const fx = edge + FORCE_GAP;
    out.push({
      type: 'vector',
      id: 'force',
      from: [fx, FORCE_Y],
      delta: [0, -fLen],
      width: FORCE_WIDTH_PX,
      headSize: FORCE_HEAD,
      opacity: alpha,
      style: FORCE,
    });
    out.push({
      type: 'readout',
      id: 'force-label',
      anchor: { world: [fx, FORCE_LABEL_Y], offset: FORCE_LABEL_OFFSET },
      text: fast ? text('label.forceTimes') : text('label.force'),
      vars: fast ? times : undefined,
      chip: false,
      align: 'left',
      font: 'text',
      italic: true,
      fontSize: LABEL_FONT_PX,
      opacity: alpha,
      style: FORCE,
    });
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
