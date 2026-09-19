// ========================================================================
// motor — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 굴대 방향에서 본 고리다. 고리 면은 선 하나로, 두 변은 단면(원)으로 보이고 전류 방향은
// ⊙(화면 밖) · ⊗(화면 안)로 가른다. 왼쪽 N · 오른쪽 S 극 사이의 자기장은 오른쪽으로 향한다.
// 굴대 한가운데에 정류자(쪼갠 고리)가 고리와 함께 돌고, 좌우의 브러시(+ 오른쪽 · − 왼쪽)는
// 제자리다. 끊김 없는 고리(슬립 링 둘)는 굴대 방향에서 겹쳐 원 하나로 보인다.
//
// 아래에서 위로 (drawOrder: 'scene') —
//   자기장 선(vector) · B → 극 조각(body rect) · 극 글자 → 수직 자리 안내선 → 변의 꼬리
//   → 고리 선 → 정류자 덮개(region opaque) → 쪼갠 호 둘 / 끊김 없는 원 → 브러시 · +/−
//   → 변 단면(바탕 덮개 + 테) → ⊙ · ⊗ → 힘 F(강조색) · 이름표.
//
// 강조색(accent)은 한 뜻에만 쓴다 — 변이 받는 힘. 극 · 고리 · 정류자 · 표식은 먹, 자기장 ·
// 안내선 · 꼬리 · 브러시는 배경 정보라 회색. 극은 `generator` 와 같은 모양(N 먹 · S 옅게)이다.
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
import { derive, readConstants, sideForce } from './physics';
import { COIL_RADIUS, SCENE_BOUNDS, text } from './schema';
import type { MotorState } from './state';

// ---- 배치(월드) ----
/** 극 조각 — 안쪽 얼굴의 가로 자리, 폭, 높이. */
const POLE_FACE_X = 1.65;
const POLE_W = 0.7;
const POLE_H = 2.8;
/** 자기장 선을 긋는 높이 — 가운데(정류자 · 브러시)는 비운다. */
const FIELD_LINE_YS: readonly number[] = [-1.2, -0.6, 0.6, 1.2];
/** 자기장 선 끝을 극 얼굴에서 띄우는 거리. */
const FIELD_LINE_INSET = 0.06;
/** 수직 자리 안내선의 위 · 아래 끝. */
const UPRIGHT_HALF = 1.5;
/** 변 단면 반지름. */
const SIDE_RADIUS = 0.13;
/** 정류자 — 쪼갠 고리의 반지름, 틈의 반각(rad), 그 둘레를 바탕으로 덮는 반지름. */
const COMMUTATOR_RADIUS = 0.24;
const COMMUTATOR_GAP = 0.2;
const COMMUTATOR_COVER = 0.34;
/** 브러시 — 굴대에서 가운데까지의 거리, 크기. 쪼갠 고리 바깥 면에 닿는다. */
const BRUSH_X = 0.36;
const BRUSH_SIZE: Vec2 = [0.12, 0.2];
/** 원 · 호 표본 수(한 바퀴 기준). */
const RING_SAMPLES = 48;
/** ⊗ 가위표 반 길이 · ⊙ 점 반지름. */
const CROSS_ARM = 0.065;
const DOT_RADIUS = 0.04;
/** 화살촉 크기(월드). */
const FORCE_HEAD = 0.15;
const FIELD_HEAD = 0.13;

// ---- 모양(화면 px · 불투명도 · 빛의 양) ----
const FIELD_WIDTH_PX = 1.4;
const FIELD_OPACITY = 0.7;
/** S 극을 N 보다 옅게 — `generator` 와 같은 값. */
const SOUTH_LUMINANCE = 0.33;
/** 먹색 N 조각 위의 글자를 바탕 쪽으로 파낸다. */
const KNOCKOUT_LUMINANCE = 0.04;
const UPRIGHT_WIDTH_PX = 1;
const UPRIGHT_OPACITY = 0.6;
const TRAIL_WIDTH_PX = 2.5;
const TRAIL_OPACITY = 0.8;
const COIL_WIDTH_PX = 3;
const COMMUTATOR_WIDTH_PX = 5;
const SIDE_RING_PX = 2.5;
const CROSS_WIDTH_PX = 2.2;
const FORCE_WIDTH_PX = 4;
/** 변 속 칠 — 0 이면 바탕 그대로다(뒤의 자기장 선 · 꼬리만 가린다). */
const COVER_FILL_OPACITY = 0;
/** 글자 크기 · 이름표 띄움(화면 px). */
const POLE_FONT_PX = 16;
const LABEL_FONT_PX = 15;
const SIGN_FONT_PX = 15;
const LABEL_GAP_PX = 11;
const FIELD_LABEL_OFFSET_PX: Vec2 = [0, -12];
const SIGN_OFFSET_PX: Vec2 = [0, 17];

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

/** 가운데 `center`, 반지름 r 인 원호의 표본(from → to, rad). */
function arc(center: Vec2, r: number, from: number, to: number): Vec2[] {
  const n = Math.max(2, Math.ceil((Math.abs(to - from) / (2 * Math.PI)) * RING_SAMPLES));
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

function circle(center: Vec2, r: number): Vec2[] {
  return arc(center, r, 0, 2 * Math.PI).slice(0, -1);
}

const AXLE: Vec2 = [0, 0];

function onCoil(theta: number): Vec2 {
  return [COIL_RADIUS * Math.cos(theta), COIL_RADIUS * Math.sin(theta)];
}

export function scene(params: {
  state: MotorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('motor: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const out: Primitive[] = [];

  // ---- 자기장 — N(왼쪽)에서 S(오른쪽)로 ----
  for (const y of FIELD_LINE_YS) {
    out.push({
      type: 'vector',
      id: `field-${y}`,
      from: [-POLE_FACE_X + FIELD_LINE_INSET, y],
      delta: [2 * (POLE_FACE_X - FIELD_LINE_INSET), 0],
      width: FIELD_WIDTH_PX,
      headSize: FIELD_HEAD,
      opacity: op * FIELD_OPACITY,
      style: muted,
    });
  }
  const topY = Math.max(...FIELD_LINE_YS);
  out.push({
    type: 'readout',
    id: 'field-label',
    anchor: { world: [POLE_FACE_X - FIELD_LINE_INSET - FIELD_HEAD, topY], offset: FIELD_LABEL_OFFSET_PX },
    text: text('label.field'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    italic: true,
    weight: 'bold',
    align: 'center',
    opacity: op,
    style: muted,
  });

  // ---- 극 조각 — N 은 먹, S 는 옅게 ----
  const nPos: Vec2 = [-POLE_FACE_X - POLE_W / 2, 0];
  const sPos: Vec2 = [POLE_FACE_X + POLE_W / 2, 0];
  out.push(
    { type: 'body', id: 'pole-n', pos: nPos, shape: 'rect', size: [POLE_W, POLE_H], opacity: op, style: ink },
    {
      type: 'body',
      id: 'pole-s',
      pos: sPos,
      shape: 'rect',
      size: [POLE_W, POLE_H],
      opacity: op,
      style: ink,
      luminance: SOUTH_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-n-label',
      anchor: { world: nPos },
      text: text('label.north'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      opacity: op,
      style: ink,
      luminance: KNOCKOUT_LUMINANCE,
    },
    {
      type: 'readout',
      id: 'pole-s-label',
      anchor: { world: sPos },
      text: text('label.south'),
      chip: false,
      font: 'text',
      weight: 'bold',
      align: 'center',
      fontSize: POLE_FONT_PX,
      opacity: op,
      style: ink,
    },
  );

  // ---- 수직 자리 — 고리 면이 자기장에 직각인 자리. 정류자가 전류를 뒤집는 곳 ----
  out.push({
    type: 'trajectory',
    id: 'upright',
    points: [
      [0, -UPRIGHT_HALF],
      [0, UPRIGHT_HALF],
    ],
    width: UPRIGHT_WIDTH_PX,
    opacity: op * UPRIGHT_OPACITY,
    style: { ...muted, lineStyle: 'dashed' },
  });

  // ---- 변이 지나온 자리 — 도는 쪽을 정지 화면에서도 읽히게 ----
  if (r.trail.length > 1) {
    for (const [id, shift] of [
      ['trail-a', 0],
      ['trail-b', Math.PI],
    ] as const) {
      out.push({
        type: 'trajectory',
        id,
        points: r.trail.map((a) => onCoil(a + shift)),
        width: TRAIL_WIDTH_PX,
        opacity: op * TRAIL_OPACITY,
        style: { ...muted, fade: 'tail' },
      });
    }
  }

  // ---- 고리 면(굴대 방향에서 본 선) ----
  const a = onCoil(r.theta);
  const b = onCoil(r.theta + Math.PI);
  out.push({ type: 'trajectory', id: 'coil', points: [a, b], width: COIL_WIDTH_PX, opacity: op, style: ink });

  // ---- 정류자 / 끊김 없는 고리 ----
  out.push({
    type: 'region',
    id: 'commutator-cover',
    points: circle(AXLE, COMMUTATOR_COVER),
    opaque: true,
    fillOpacity: COVER_FILL_OPACITY,
    opacity: op,
    style: ink,
  });
  if (r.connection === 'commutator') {
    // 반쪽마다 한 변에 붙는다 — 변 A 쪽 반쪽은 A 방향을 가운데로 둔다. 틈은 고리 면에 직각이다.
    const halfA = arc(AXLE, COMMUTATOR_RADIUS, r.theta - Math.PI / 2 + COMMUTATOR_GAP, r.theta + Math.PI / 2 - COMMUTATOR_GAP);
    const halfB = arc(
      AXLE,
      COMMUTATOR_RADIUS,
      r.theta + Math.PI / 2 + COMMUTATOR_GAP,
      r.theta + (3 * Math.PI) / 2 - COMMUTATOR_GAP,
    );
    out.push(
      { type: 'trajectory', id: 'commutator-a', points: halfA, width: COMMUTATOR_WIDTH_PX, opacity: op, style: ink },
      { type: 'trajectory', id: 'commutator-b', points: halfB, width: COMMUTATOR_WIDTH_PX, opacity: op, style: ink },
    );
  } else {
    out.push({
      type: 'trajectory',
      id: 'slip-rings',
      points: circle(AXLE, COMMUTATOR_RADIUS),
      closed: true,
      width: COMMUTATOR_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }

  // ---- 브러시 — 제자리. 오른쪽 +, 왼쪽 − ----
  for (const [id, x, msg] of [
    ['brush-plus', BRUSH_X, 'label.plus'],
    ['brush-minus', -BRUSH_X, 'label.minus'],
  ] as const) {
    out.push(
      { type: 'body', id, pos: [x, 0], shape: 'rect', size: BRUSH_SIZE, opacity: op, style: muted },
      {
        type: 'readout',
        id: `${id}-sign`,
        anchor: { world: [x, -BRUSH_SIZE[1] / 2], offset: SIGN_OFFSET_PX },
        text: text(msg),
        chip: false,
        font: 'text',
        fontSize: SIGN_FONT_PX,
        weight: 'bold',
        align: 'center',
        opacity: op,
        style: ink,
      },
    );
  }

  // ---- 변 단면 · 전류 표식 · 힘 ----
  const forceLen = sideForce(c) * c.forceScale;
  const sides: readonly { id: string; pos: Vec2; sign: number }[] = [
    { id: 'side-a', pos: a, sign: r.signA },
    { id: 'side-b', pos: b, sign: -r.signA },
  ];
  for (const s of sides) {
    const ring = circle(s.pos, SIDE_RADIUS);
    out.push(
      {
        type: 'region',
        id: `${s.id}-inside`,
        points: ring,
        opaque: true,
        fillOpacity: COVER_FILL_OPACITY,
        opacity: op,
        style: ink,
      },
      { type: 'trajectory', id: `${s.id}-ring`, points: ring, closed: true, width: SIDE_RING_PX, opacity: op, style: ink },
    );
    if (s.sign < 0) {
      const d = CROSS_ARM;
      const [x, y] = s.pos;
      out.push({
        type: 'lineSet',
        id: `${s.id}-in`,
        lines: [
          [
            [x - d, y - d],
            [x + d, y + d],
          ],
          [
            [x - d, y + d],
            [x + d, y - d],
          ],
        ],
        width: CROSS_WIDTH_PX,
        opacity: op,
        style: ink,
      });
    } else if (s.sign > 0) {
      out.push({
        type: 'body',
        id: `${s.id}-out`,
        pos: s.pos,
        shape: 'circle',
        size: DOT_RADIUS,
        glow: false,
        outline: 'none',
        opacity: op,
        style: ink,
      });
    }
  }
  // 힘은 단면을 모두 그린 뒤에 긋는다 — 수직 자리에서 한 변의 힘이 다른 변 쪽으로 뻗어도 덮이지 않게.
  for (const s of sides) {
    if (s.sign === 0) continue;
    // ⊙ 는 위, ⊗ 는 아래 (B 가 오른쪽일 때 F = I L × B).
    const dir = s.sign > 0 ? 1 : -1;
    const from: Vec2 = [s.pos[0], s.pos[1] + dir * SIDE_RADIUS];
    // 이름표는 화살표 가운데 옆, 굴대에서 먼 쪽에 둔다 — 끝 너머는 수직 자리에서 정류자 위에 얹힌다.
    const side = s.pos[0] >= 0 ? 1 : -1;
    out.push(
      {
        type: 'vector',
        id: `${s.id}-force`,
        from,
        delta: [0, dir * forceLen],
        width: FORCE_WIDTH_PX,
        headSize: FORCE_HEAD,
        outline: 'background',
        opacity: op,
        style: accent,
      },
      {
        type: 'readout',
        id: `${s.id}-force-label`,
        anchor: { world: [from[0], from[1] + (dir * forceLen) / 2], offset: [side * LABEL_GAP_PX, 0] },
        text: text('label.force'),
        chip: false,
        font: 'text',
        fontSize: LABEL_FONT_PX,
        italic: true,
        weight: 'bold',
        align: side > 0 ? 'left' : 'right',
        opacity: op,
        style: accent,
      },
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 가장 높이 · 낮게 뻗은 힘의 이름표까지 들어간다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
