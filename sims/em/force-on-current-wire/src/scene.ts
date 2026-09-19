// ========================================================================
// force-on-current-wire — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 도선을 **제 축을 따라** 본 옆모습이다. 도선은 단면(원)으로 보이고 전류 방향은 ⊗(화면
// 안쪽) · ⊙(화면 밖)으로 가른다. 말굽자석은 N 이 위, S 가 아래라 틈의 자기장은 아래로 향한다.
// 그네 막대는 받침점에서 도선까지 한 선으로 겹쳐 보인다(앞뒤 두 다리).
//
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   자석 → 자기장 선 · 이름 → 받침 → 잔상(more · charges) → 막대 → 도선 속(바탕으로 덮음)
//   → 도선 테 → 전류 표식 → 확대 창(charges) → 힘 → 이름표 · 전류 값
//
// 강조색(accent)은 한 뜻에만 쓴다 — 힘. 도선이 받는 F 와 전자마다의 작은 힘이 같은 대상이라
// 같은 색이다. 자석 · 자기장은 배경 정보라 회색, 도선 · 막대 · 표식은 먹.
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
import { derive, readConstants, type ForceOnCurrentWireConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ForceOnCurrentWireState } from './state';

// ---- 배치(월드) ----
/** 그네 받침점. */
const PIVOT: Vec2 = [0, 2.3];
/** 받침 막대의 반 길이. */
const SUPPORT_HALF = 0.55;
/** 자석 — 극 얼굴 사이 틈의 위 · 아래, 왼쪽 끝, 틈 안쪽 끝(요크 시작), 요크 바깥 끝, 자석 위 · 아래 끝. */
const GAP_TOP = 0.8;
const GAP_BOTTOM = -0.8;
const MAGNET_LEFT = -2;
const YOKE_INNER = 1.45;
const MAGNET_RIGHT = 1.95;
const MAGNET_TOP = 1.28;
const MAGNET_BOTTOM = -1.28;
/** 극 글자 N · S 의 가로 자리(왼쪽 끝 가까이). */
const POLE_LABEL_X = -1.7;
/** 자기장 선을 긋는 가로 자리 — 가운데(막대 · 도선이 쉬는 곳)는 비운다. */
const FIELD_LINE_XS: readonly number[] = [-1.7, -1, 0.55, 1.15];
/** 자기장 이름표를 세우는 높이 — 오른쪽으로 튄 도선의 F 이름표와 겹치지 않게 아래쪽. */
const FIELD_LABEL_Y = -0.45;
/** 자기장 선 끝을 극 얼굴에서 띄우는 거리. */
const FIELD_LINE_INSET = 0.06;
/** 도선 단면 반지름. */
const WIRE_RADIUS = 0.2;
/** 원 표본 수. */
const RING_SAMPLES = 48;
/** ⊗ 가위표 반 길이 · ⊙ 점 반지름. */
const CROSS_ARM = 0.085;
const DOT_RADIUS = 0.05;
/**
 * 확대 창 — 도선 단면을 키워 속의 전자를 보인다. 왼쪽 위 빈 자리(자석 위, 막대 왼쪽)에 고정한다.
 * 도선이 어디로 튀든 창은 움직이지 않고 이음선이 도선을 따라간다.
 */
const INSET_CENTER: Vec2 = [-1.95, 1.95];
const INSET_RADIUS = 0.5;
/** 전자들이 세로로 늘어서는 간격(창 안). */
const ELECTRON_SPACING = 0.24;
/** 작은 화살표 길이 중 전자 점을 도선 중심에서 뒤로 물리는 몫 — 화살표가 테 안에 머문다. */
const ELECTRON_BACKOFF = 0.5;
/** 화살촉 크기(월드). */
const HEAD_SIZE = 0.16;
const SMALL_HEAD_SIZE = 0.07;
const FIELD_HEAD_SIZE = 0.14;

// ---- 모양(화면 px · 불투명도) ----
const MAGNET_FILL_OPACITY = 0.28;
const FIELD_WIDTH_PX = 1.6;
const FIELD_OPACITY = 0.8;
const ROD_WIDTH_PX = 2;
const SUPPORT_WIDTH_PX = 3;
const RING_WIDTH_PX = 2.5;
const CROSS_WIDTH_PX = 2.2;
const FORCE_WIDTH_PX = 4.5;
const SMALL_FORCE_WIDTH_PX = 2;
/** 전자 점 반지름(화면 px — `particleSystem.sizes` 의 단위). */
const ELECTRON_RADIUS_PX = 5;
const INSET_WIDTH_PX = 2;
const LINK_WIDTH_PX = 1;
const LINK_OPACITY = 0.7;
const GHOST_WIDTH_PX = 2;
const GHOST_OPACITY = 0.5;
/** 도선 속 칠 — 0 이면 바탕 그대로다(뒤의 자기장 선만 가린다). */
const WIRE_FILL_OPACITY = 0;
/** 글자 크기 · 이름표 띄움(화면 px). */
const LABEL_FONT_PX = 16;
const POLE_FONT_PX = 18;
const VALUE_FONT_PX = 14;
const SMALL_FONT_PX = 13;
const LABEL_GAP_PX = 14;
const FIELD_LABEL_OFFSET_PX: Vec2 = [14, 0];
const ELECTRON_LABEL_OFFSET_PX: Vec2 = [-8, 0];
const CURRENT_OFFSET_PX: Vec2 = [14, 0];
/** 이 아래의 힘 화면 길이(월드)면 화살표를 두지 않는다 — 머리만 남은 점이 방향처럼 읽힌다. */
const FORCE_VISIBLE = 0.02;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

function circle(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 그네 각 θ(+ 오른쪽)일 때 도선 중심. */
function wireAt(angle: number, c: ForceOnCurrentWireConstants): Vec2 {
  return [PIVOT[0] + c.swingLength * Math.sin(angle), PIVOT[1] - c.swingLength * Math.cos(angle)];
}

/** 도선 테에서 시작해 힘 쪽으로 뻗는 화살표(월드). 힘이 너무 작으면 없다. */
function forceArrow(
  id: string,
  center: Vec2,
  force: number,
  c: ForceOnCurrentWireConstants,
  width: number,
  style: { colorRole: 'accent'; emphasis: 'strong' },
  opacity: number,
): { prim: Primitive; tip: Vec2 } | undefined {
  const len = force * c.forceScale;
  if (Math.abs(len) < FORCE_VISIBLE) return undefined;
  const dir = Math.sign(len);
  const from: Vec2 = [center[0] + dir * WIRE_RADIUS, center[1]];
  return {
    prim: { type: 'vector', id, from, delta: [len, 0], width, headSize: HEAD_SIZE, outline: 'background', opacity, style },
    tip: [from[0] + len, from[1]],
  };
}

export function scene(params: {
  state: ForceOnCurrentWireState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('force-on-current-wire: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const out: Primitive[] = [];

  // ---- 말굽자석 — 옆으로 누운 ㄷ 자. 위 팔이 N, 아래 팔이 S, 오른쪽이 요크 ----
  out.push({
    type: 'region',
    id: 'magnet',
    points: [
      [MAGNET_LEFT, MAGNET_TOP],
      [MAGNET_RIGHT, MAGNET_TOP],
      [MAGNET_RIGHT, MAGNET_BOTTOM],
      [MAGNET_LEFT, MAGNET_BOTTOM],
      [MAGNET_LEFT, GAP_BOTTOM],
      [YOKE_INNER, GAP_BOTTOM],
      [YOKE_INNER, GAP_TOP],
      [MAGNET_LEFT, GAP_TOP],
    ],
    fillOpacity: MAGNET_FILL_OPACITY,
    outline: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
    opacity: op,
    style: muted,
  });
  const poleLabel = (id: string, y: number, msg: 'label.north' | 'label.south'): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: [POLE_LABEL_X, y] },
    text: text(msg),
    chip: false,
    font: 'text',
    fontSize: POLE_FONT_PX,
    weight: 'bold',
    align: 'center',
    opacity: op,
    style: ink,
  });
  out.push(poleLabel('pole-n', (MAGNET_TOP + GAP_TOP) / 2, 'label.north'));
  out.push(poleLabel('pole-s', (MAGNET_BOTTOM + GAP_BOTTOM) / 2, 'label.south'));

  // ---- 틈의 자기장 — N 에서 S 로, 아래로 ----
  for (const x of FIELD_LINE_XS) {
    out.push({
      type: 'vector',
      id: `field-${x}`,
      from: [x, GAP_TOP - FIELD_LINE_INSET],
      delta: [0, GAP_BOTTOM - GAP_TOP + 2 * FIELD_LINE_INSET],
      width: FIELD_WIDTH_PX,
      headSize: FIELD_HEAD_SIZE,
      opacity: op * FIELD_OPACITY,
      style: muted,
    });
  }
  const lastX = FIELD_LINE_XS[FIELD_LINE_XS.length - 1] ?? 0;
  out.push({
    type: 'readout',
    id: 'field-label',
    anchor: { world: [lastX, FIELD_LABEL_Y], offset: FIELD_LABEL_OFFSET_PX },
    text: text('label.field'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    italic: true,
    weight: 'bold',
    align: 'left',
    opacity: op,
    style: muted,
  });

  // ---- 받침 ----
  out.push({
    type: 'trajectory',
    id: 'support',
    points: [
      [PIVOT[0] - SUPPORT_HALF, PIVOT[1]],
      [PIVOT[0] + SUPPORT_HALF, PIVOT[1]],
    ],
    width: SUPPORT_WIDTH_PX,
    opacity: op,
    style: ink,
  });

  // ---- 잔상 — 작은 전류일 때 멈춰 있던 자리. 키운 뒤에만 남는다 ----
  // 그때의 F 는 남기지 않는다 — 지금 도선의 속이 그 화살표를 덮어 토막만 남는다(1차 촬영).
  const showGhost = timeline.at('more') > 0 || timeline.phase === 'more';
  if (showGhost) {
    const gc = wireAt(r.lowAngle, c);
    const gop = op * GHOST_OPACITY;
    out.push(
      {
        type: 'trajectory',
        id: 'ghost-rod',
        points: [PIVOT, gc],
        width: GHOST_WIDTH_PX,
        opacity: gop,
        style: { ...muted, lineStyle: 'dashed' },
      },
      {
        type: 'trajectory',
        id: 'ghost-ring',
        points: circle(gc, WIRE_RADIUS),
        closed: true,
        width: GHOST_WIDTH_PX,
        opacity: gop,
        style: { ...muted, lineStyle: 'dashed' },
      },
    );
  }

  // ---- 그네 막대와 도선 ----
  const wc = wireAt(r.angle, c);
  out.push({
    type: 'trajectory',
    id: 'rod',
    points: [PIVOT, wc],
    width: ROD_WIDTH_PX,
    opacity: op,
    style: ink,
  });
  const ring = circle(wc, WIRE_RADIUS);
  out.push(
    {
      type: 'region',
      id: 'wire-inside',
      points: ring,
      opaque: true,
      fillOpacity: WIRE_FILL_OPACITY,
      opacity: op,
      style: ink,
    },
    {
      type: 'trajectory',
      id: 'wire-ring',
      points: ring,
      closed: true,
      width: RING_WIDTH_PX,
      opacity: op,
      style: ink,
    },
  );

  // ---- 전류 표식(⊗ 안쪽 · ⊙ 밖) ----
  if (r.current > 0) {
    const d = CROSS_ARM;
    out.push({
      type: 'lineSet',
      id: 'current-in',
      lines: [
        [
          [wc[0] - d, wc[1] - d],
          [wc[0] + d, wc[1] + d],
        ],
        [
          [wc[0] - d, wc[1] + d],
          [wc[0] + d, wc[1] - d],
        ],
      ],
      width: CROSS_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  } else if (r.current < 0) {
    out.push({
      type: 'body',
      id: 'current-out',
      pos: wc,
      shape: 'circle',
      size: DOT_RADIUS,
      glow: false,
      outline: 'none',
      opacity: op,
      style: ink,
    });
  }

  // ---- 확대 창 — 도선 속 전자 하나하나가 도선과 같은 쪽으로 밀린다 ----
  const showCharges = timeline.at('charges') > 0 || timeline.phase === 'charges';
  if (showCharges) {
    // 이음선 — 두 원의 중심을 잇는 방향에 직각인 양쪽 끝끼리.
    const dx = wc[0] - INSET_CENTER[0];
    const dy = wc[1] - INSET_CENTER[1];
    const d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d;
    const ny = dx / d;
    const link = (s: number): Vec2[] => [
      [INSET_CENTER[0] + s * nx * INSET_RADIUS, INSET_CENTER[1] + s * ny * INSET_RADIUS],
      [wc[0] + s * nx * WIRE_RADIUS, wc[1] + s * ny * WIRE_RADIUS],
    ];
    for (const side of [1, -1]) {
      out.push({
        type: 'trajectory',
        id: `inset-link-${side}`,
        points: link(side),
        width: LINK_WIDTH_PX,
        opacity: op * LINK_OPACITY,
        style: { ...muted, lineStyle: 'dashed' },
      });
    }
    const insetRing = circle(INSET_CENTER, INSET_RADIUS);
    out.push(
      {
        type: 'region',
        id: 'inset-inside',
        points: insetRing,
        opaque: true,
        fillOpacity: WIRE_FILL_OPACITY,
        opacity: op,
        style: ink,
      },
      {
        type: 'trajectory',
        id: 'inset-ring',
        points: insetRing,
        closed: true,
        width: INSET_WIDTH_PX,
        opacity: op,
        style: ink,
      },
    );
    const n = Math.max(1, Math.round(c.chargeCount));
    const dir = Math.sign(r.force) || -1;
    // 점을 화살표 반대쪽으로 비켜 화살표가 창 안에 머물게 한다.
    const x0 = INSET_CENTER[0] - dir * c.chargeArrow * ELECTRON_BACKOFF;
    const positions: Vec2[] = [];
    for (let i = 0; i < n; i++) {
      positions.push([x0, INSET_CENTER[1] + (i - (n - 1) / 2) * ELECTRON_SPACING]);
    }
    positions.forEach((p, i) => {
      out.push({
        type: 'vector',
        id: `electron-force-${i}`,
        from: p,
        delta: [dir * c.chargeArrow, 0],
        width: SMALL_FORCE_WIDTH_PX,
        headSize: SMALL_HEAD_SIZE,
        opacity: op,
        style: accent,
      });
    });
    out.push({
      type: 'particleSystem',
      id: 'electrons',
      positions,
      sizes: ELECTRON_RADIUS_PX,
      opacity: op,
      style: ink,
    });
    // 이름표는 창 밖 왼쪽 — 창 안은 점과 화살표로 차 있고, 오른쪽으로는 이음선이 지나간다.
    out.push({
      type: 'readout',
      id: 'electron-label',
      anchor: { world: [INSET_CENTER[0] - INSET_RADIUS, INSET_CENTER[1]], offset: ELECTRON_LABEL_OFFSET_PX },
      text: text('label.electron'),
      chip: false,
      font: 'text',
      fontSize: SMALL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: 'right',
      opacity: op,
      style: ink,
    });
  }

  // ---- 도선이 받는 힘 ----
  const fa = forceArrow('force', wc, r.force, c, FORCE_WIDTH_PX, accent, op);
  if (fa) {
    out.push(fa.prim);
    const dir = Math.sign(r.force);
    out.push({
      type: 'readout',
      id: 'force-label',
      anchor: { world: fa.tip, offset: [dir * LABEL_GAP_PX, 0] },
      text: text('label.force'),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: dir < 0 ? 'right' : 'left',
      opacity: op,
      style: accent,
    });
  }

  // ---- 지금 전류 — 선언한 정박값의 글자 그대로 ----
  out.push({
    type: 'readout',
    id: 'current-value',
    anchor: { world: [PIVOT[0] + SUPPORT_HALF, PIVOT[1]], offset: CURRENT_OFFSET_PX },
    text: text('label.current'),
    vars: { i: String(Math.abs(r.current)) },
    chip: false,
    font: 'text',
    fontSize: VALUE_FONT_PX,
    italic: true,
    align: 'left',
    opacity: op,
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 도선이 가장 멀리 튄 순간의 F 이름표까지 들어간다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
